// =====================================
// SMART GREENHOUSE RULE GENERATOR
// =====================================


// =====================================
// GET SENSOR NAME
// =====================================

function getSensorName(block) {

    if (!block) {
        return null;
    }

    switch (block.type) {

        case "get_temperature":
            return "temperature";

        case "get_humidity":
            return "humidity";

        case "get_soil_moisture":
            return "soilMoisture";

        default:
            return null;
    }
}


// =====================================
// GET NUMBER VALUE
// =====================================

function getNumberValue(block) {

    if (
        !block ||
        block.type !== "math_number"
    ) {
        return null;
    }

    return Number(
        block.getFieldValue("NUM")
    );
}

function parseCondition(block) {

    if (!block) {
        return null;
    }

    // SIMPLE COMPARISON
    if (block.type === "logic_compare") {

        const leftBlock =
            block.getInputTargetBlock("A");

        const rightBlock =
            block.getInputTargetBlock("B");

        const sensor =
            getSensorName(leftBlock);

        const value =
            getNumberValue(rightBlock);

        const operator =
            block.getFieldValue("OP");

        if (
            sensor === null ||
            value === null
        ) {
            return null;
        }

        return {
            type: "condition",
            sensor: sensor,
            operator: operator,
            value: value
        };
    }

    // AND / OR
    if (block.type === "logic_operation") {

        const leftBlock =
            block.getInputTargetBlock("A");

        const rightBlock =
            block.getInputTargetBlock("B");

        const leftCondition =
            parseCondition(leftBlock);

        const rightCondition =
            parseCondition(rightBlock);

        if (
            !leftCondition ||
            !rightCondition
        ) {
            return null;
        }

        return {
            type: block.getFieldValue("OP") === "AND"
                ? "AND"
                : "OR",

            conditions: [
                leftCondition,
                rightCondition
            ]
        };
    }

    return null;
}
// =====================================
// WORKSPACE → STRUCTURED JSON RULES
// =====================================

function workspaceToRules() {

    const rules = [];


    const blocks =
        workspace.getTopBlocks(true);


    blocks.forEach(function (block) {


        // Only process IF blocks
        if (block.type !== "controls_if") {
            return;
        }


        // -------------------------------
        // CONDITION
        // -------------------------------

        const conditionBlock =
            block.getInputTargetBlock("IF0");


        if (!conditionBlock) {
            return;
        }


        const conditions =
            parseCondition(
                conditionBlock
            );


        if (conditions.length === 0) {
            return;
        }


        // -------------------------------
        // ACTIONS
        // -------------------------------

        let actionBlock =
            block.getInputTargetBlock("DO0");


        while (actionBlock) {


            // ===========================
            // WATER PUMP
            // ===========================

            if (
                actionBlock.type ===
                "water_pump"
            ) {

                const state =
                    actionBlock.getFieldValue(
                        "STATE"
                    );


                rules.push({

                    conditions:
                        conditions,

                    action: {

                        type: "pump",

                        value:
                            state === "ON"
                    }
                });
            }


            // ===========================
            // VENTILATION
            // ===========================

            if (
                actionBlock.type ===
                "set_ventilation"
            ) {

                const angleBlock =
                    actionBlock.getInputTargetBlock(
                        "ANGLE"
                    );


                const angle =
                    getNumberValue(
                        angleBlock
                    );


                if (angle !== null) {

                    rules.push({

                        conditions:
                            conditions,

                        action: {

                            type:
                                "ventilation",

                            angle:
                                angle
                        }
                    });
                }
            }


            actionBlock =
                actionBlock.getNextBlock();
        }

    });


    return {
        rules: rules
    };
}