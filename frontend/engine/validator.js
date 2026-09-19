// =====================================
// SMART GREENHOUSE VALIDATOR
// DAY 6 - VALIDATION & SAFETY
// =====================================


// =====================================
// ALLOWED SENSORS
// =====================================

const allowedSensors = [
    "temperature",
    "humidity",
    "soilMoisture"
];


// =====================================
// ALLOWED OPERATORS
// =====================================

const allowedOperators = [
    ">",
    "<",
    ">=",
    "<=",
    "==",
    "!=",
    "GT",
    "LT",
    "GTE",
    "LTE",
    "EQ",
    "NEQ"
];


// =====================================
// NUMBER CHECK
// =====================================

function isValidNumber(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return false;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue);
}


// =====================================
// NORMALIZE OPERATOR
// =====================================

function normalizeOperator(operator) {

    const operatorMap = {

        GT: ">",
        LT: "<",
        GTE: ">=",
        LTE: "<=",
        EQ: "==",
        NEQ: "!="
    };

    return operatorMap[operator] || operator;
}


// =====================================
// VALIDATE SINGLE CONDITION
// =====================================

function validateCondition(condition) {

    const errors = [];

    if (!condition) {

        return {
            valid: false,
            errors: [
                "Condition is missing"
            ]
        };
    }


    // =================================
    // SENSOR
    // =================================

    if (
        !allowedSensors.includes(
            condition.sensor
        )
    ) {

        errors.push(
            `Invalid sensor: ${condition.sensor}`
        );
    }


    // =================================
    // OPERATOR
    // =================================

    if (
        !allowedOperators.includes(
            condition.operator
        )
    ) {

        errors.push(
            `Invalid operator: ${condition.operator}`
        );
    }


    // =================================
    // VALUE
    // =================================

    if (!isValidNumber(condition.value)) {

        errors.push(
            "Condition value must be a valid number"
        );
    }


    return {
        valid: errors.length === 0,
        errors: errors
    };
}


// =====================================
// VALIDATE ACTION
// =====================================

function validateAction(action) {

    const errors = [];

    if (!action || !action.type) {

        return {
            valid: false,
            errors: [
                "Action is missing"
            ]
        };
    }


    // =================================
    // WATER PUMP
    // =================================

    if (action.type === "pump") {

        if (
            typeof action.value !== "boolean"
        ) {

            errors.push(
                "Pump value must be true or false"
            );
        }
    }


    // =================================
    // VENTILATION
    // =================================

    else if (
        action.type === "ventilation"
    ) {

        const angle = Number(
            action.angle
        );

        if (!Number.isFinite(angle)) {

            errors.push(
                "Ventilation angle must be a number"
            );

        } else if (
            angle < 0 ||
            angle > 90
        ) {

            errors.push(
                "Ventilation angle must be between 0 and 90 degrees"
            );
        }
    }


    // =================================
    // UNKNOWN ACTION
    // =================================

    else {

        errors.push(
            `Unknown action type: ${action.type}`
        );
    }


    return {
        valid: errors.length === 0,
        errors: errors
    };
}


// =====================================
// GET CONDITION SIGNATURE
// =====================================

function getConditionSignature(conditions) {

    if (!conditions) {
        return "";
    }


    // =================================
    // ARRAY FORMAT
    // =================================

    if (Array.isArray(conditions)) {

        const normalizedConditions =
            conditions.map(
                function (condition) {

                    return {
                        sensor: condition.sensor,
                        operator: normalizeOperator(
                            condition.operator
                        ),
                        value: Number(
                            condition.value
                        )
                    };
                }
            );

        return JSON.stringify({
            type: "AND",
            conditions: normalizedConditions
        });
    }


    // =================================
    // SINGLE CONDITION
    // =================================

    if (
        conditions.type === "condition"
    ) {

        return JSON.stringify({
            type: "condition",
            sensor: conditions.sensor,
            operator: normalizeOperator(
                conditions.operator
            ),
            value: Number(
                conditions.value
            )
        });
    }


    // =================================
    // AND / OR GROUP
    // =================================

    if (
        conditions.type === "AND" ||
        conditions.type === "OR"
    ) {

        const normalizedConditions =
            Array.isArray(
                conditions.conditions
            )
                ? conditions.conditions.map(
                    function (condition) {

                        return {
                            sensor:
                                condition.sensor,

                            operator:
                                normalizeOperator(
                                    condition.operator
                                ),

                            value:
                                Number(
                                    condition.value
                                )
                        };

                    }
                )
                : [];

        return JSON.stringify({
            type: conditions.type,
            conditions: normalizedConditions
        });
    }


    return "";
}


// =====================================
// GET ACTION SIGNATURE
// =====================================

function getActionSignature(action) {

    if (!action) {
        return "";
    }


    if (action.type === "pump") {

        return JSON.stringify({
            type: "pump",
            value: Boolean(
                action.value
            )
        });
    }


    if (
        action.type === "ventilation"
    ) {

        return JSON.stringify({
            type: "ventilation",
            angle: Number(
                action.angle
            )
        });
    }


    return "";
}


// =====================================
// VALIDATE ONE RULE
// =====================================

function validateRule(rule) {

    const errors = [];

    if (!rule) {

        return {
            valid: false,
            errors: [
                "Rule is missing"
            ]
        };
    }


    // =================================
    // CONDITIONS
    // =================================

    if (!rule.conditions) {

        errors.push(
            "Rule must contain at least one condition"
        );

    } else if (
        Array.isArray(
            rule.conditions
        )
    ) {

        // =================================
        // OLD / AND ARRAY FORMAT
        // =================================

        if (
            rule.conditions.length === 0
        ) {

            errors.push(
                "Rule must contain at least one condition"
            );

        } else {

            rule.conditions.forEach(
                function (
                    condition,
                    index
                ) {

                    const result =
                        validateCondition(
                            condition
                        );

                    if (!result.valid) {

                        result.errors.forEach(
                            function (error) {

                                errors.push(
                                    `Condition ${index + 1}: ${error}`
                                );

                            }
                        );
                    }

                }
            );
        }

    } else if (
        rule.conditions.type === "condition"
    ) {

        // =================================
        // SINGLE CONDITION OBJECT
        // =================================

        const result =
            validateCondition(
                rule.conditions
            );

        if (!result.valid) {

            result.errors.forEach(
                function (error) {

                    errors.push(
                        `Condition: ${error}`
                    );

                }
            );
        }

    } else {

        // =================================
        // AND / OR GROUP
        // =================================

        const group =
            rule.conditions;

        if (
            group.type !== "AND" &&
            group.type !== "OR"
        ) {

            errors.push(
                "Invalid condition group"
            );

        } else if (
            !Array.isArray(
                group.conditions
            ) ||
            group.conditions.length === 0
        ) {

            errors.push(
                "Condition group must contain conditions"
            );

        } else {

            group.conditions.forEach(
                function (
                    condition,
                    index
                ) {

                    const result =
                        validateCondition(
                            condition
                        );

                    if (!result.valid) {

                        result.errors.forEach(
                            function (error) {

                                errors.push(
                                    `Condition ${index + 1}: ${error}`
                                );

                            }
                        );
                    }

                }
            );
        }
    }


    // =================================
    // ACTION
    // =================================

    const actionResult =
        validateAction(
            rule.action
        );

    if (!actionResult.valid) {

        actionResult.errors.forEach(
            function (error) {

                errors.push(error);

            }
        );
    }


    return {
        valid: errors.length === 0,
        errors: errors
    };
}


// =====================================
// DETECT CONFLICTING RULES
// =====================================

function detectConflictingRules(rules) {

    const errors = [];

    for (
        let i = 0;
        i < rules.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < rules.length;
            j++
        ) {

            const ruleA = rules[i];
            const ruleB = rules[j];

            const conditionA =
                getConditionSignature(
                    ruleA.conditions
                );

            const conditionB =
                getConditionSignature(
                    ruleB.conditions
                );


            // Different conditions
            if (
                conditionA !== conditionB
            ) {
                continue;
            }


            // =================================
            // PUMP CONFLICT
            // =================================

            if (
                ruleA.action &&
                ruleB.action &&
                ruleA.action.type === "pump" &&
                ruleB.action.type === "pump"
            ) {

                if (
                    ruleA.action.value !==
                    ruleB.action.value
                ) {

                    errors.push(
                        `Conflicting Rules: Rule ${i + 1} and Rule ${j + 1} configure the pump in opposite states for the same condition`
                    );
                }
            }


            // =================================
            // VENTILATION CONFLICT
            // =================================

            if (
                ruleA.action &&
                ruleB.action &&
                ruleA.action.type ===
                    "ventilation" &&
                ruleB.action.type ===
                    "ventilation"
            ) {

                if (
                    Number(
                        ruleA.action.angle
                    ) !==
                    Number(
                        ruleB.action.angle
                    )
                ) {

                    errors.push(
                        `Conflicting Rules: Rule ${i + 1} and Rule ${j + 1} set different ventilation angles for the same condition`
                    );
                }
            }
        }
    }


    return errors;
}


// =====================================
// DETECT DUPLICATE RULES
// =====================================

function detectDuplicateRules(rules) {

    const errors = [];
    const seen = new Map();

    rules.forEach(
        function (rule, index) {

            const conditionSignature =
                getConditionSignature(
                    rule.conditions
                );

            const actionSignature =
                getActionSignature(
                    rule.action
                );

            const signature =
                conditionSignature +
                "|" +
                actionSignature;


            if (
                seen.has(signature)
            ) {

                const previousIndex =
                    seen.get(signature);

                errors.push(
                    `Duplicate Rule: Rule ${previousIndex + 1} and Rule ${index + 1} are identical`
                );

            } else {

                seen.set(
                    signature,
                    index
                );
            }
        }
    );


    return errors;
}


// =====================================
// VALIDATE ALL RULES
// =====================================

function validateRules(ruleData) {

    const errors = [];

    if (!ruleData) {

        return {
            valid: false,
            errors: [
                "Rule data is missing"
            ]
        };
    }


    if (
        !Array.isArray(
            ruleData.rules
        ) ||
        ruleData.rules.length === 0
    ) {

        return {
            valid: false,
            errors: [
                "No rules found"
            ]
        };
    }


    // =================================
    // VALIDATE EACH RULE
    // =================================

    ruleData.rules.forEach(
        function (
            rule,
            index
        ) {

            const result =
                validateRule(rule);

            if (!result.valid) {

                result.errors.forEach(
                    function (error) {

                        errors.push(
                            `Rule ${index + 1}: ${error}`
                        );

                    }
                );
            }
        }
    );


    // =================================
    // CONFLICT CHECK
    // =================================

    const conflictErrors =
        detectConflictingRules(
            ruleData.rules
        );

    errors.push(
        ...conflictErrors
    );


    // =================================
    // DUPLICATE CHECK
    // =================================

    const duplicateErrors =
        detectDuplicateRules(
            ruleData.rules
        );

    errors.push(
        ...duplicateErrors
    );


    return {
        valid: errors.length === 0,
        errors: errors
    };
}