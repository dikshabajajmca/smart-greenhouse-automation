// =====================================
// SMART GREENHOUSE VALIDATOR
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
// VALIDATE SINGLE CONDITION
// =====================================

function validateCondition(condition) {

    const errors = [];

    if (!condition) {

        return {
            valid: false,
            errors: ["Condition is missing"]
        };
    }


    // Sensor
    if (!allowedSensors.includes(condition.sensor)) {

        errors.push(
            `Invalid sensor: ${condition.sensor}`
        );
    }


    // Operator
    if (!allowedOperators.includes(condition.operator)) {

        errors.push(
            `Invalid operator: ${condition.operator}`
        );
    }


    // Value
    if (
        condition.value === undefined ||
        condition.value === null ||
        Number.isNaN(Number(condition.value))
    ) {

        errors.push(
            "Condition value must be a number"
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
            errors: ["Action is missing"]
        };
    }


    // ================================
    // WATER PUMP
    // ================================

    if (action.type === "pump") {

        if (typeof action.value !== "boolean") {

            errors.push(
                "Pump value must be true or false"
            );
        }
    }


    // ================================
    // VENTILATION
    // ================================

    else if (action.type === "ventilation") {

        const angle = Number(action.angle);

        if (Number.isNaN(angle)) {

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


    // ================================
    // UNKNOWN ACTION
    // ================================

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
// VALIDATE ONE RULE
// =====================================

function validateRule(rule) {

    const errors = [];

    if (!rule) {

        return {
            valid: false,
            errors: ["Rule is missing"]
        };
    }


    // =================================
    // CONDITIONS
    // =================================

    if (!rule.conditions) {

        errors.push(
            "Rule must contain at least one condition"
        );

    } else if (Array.isArray(rule.conditions)) {

        // OLD / AND ARRAY FORMAT

        if (rule.conditions.length === 0) {

            errors.push(
                "Rule must contain at least one condition"
            );

        } else {

            rule.conditions.forEach(
                function (condition, index) {

                    const result =
                        validateCondition(condition);

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
            !Array.isArray(group.conditions) ||
            group.conditions.length === 0
        ) {

            errors.push(
                "Condition group must contain conditions"
            );

        } else {

            group.conditions.forEach(
                function (condition, index) {

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
// VALIDATE ALL RULES
// =====================================

function validateRules(ruleData) {

    const errors = [];

    if (!ruleData) {

        return {
            valid: false,
            errors: ["Rule data is missing"]
        };
    }


    if (
        !Array.isArray(ruleData.rules) ||
        ruleData.rules.length === 0
    ) {

        return {
            valid: false,
            errors: ["No rules found"]
        };
    }


    ruleData.rules.forEach(
        function (rule, index) {

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


    return {
        valid: errors.length === 0,
        errors: errors
    };
}