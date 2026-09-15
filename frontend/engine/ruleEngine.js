// =====================================
// SMART GREENHOUSE RULE ENGINE
// =====================================


// =====================================
// COMPARE VALUES
// =====================================

function compareValues(left, operator, right) {

    switch (operator) {

        case ">":
        case "GT":
            return left > right;

        case "<":
        case "LT":
            return left < right;

        case ">=":
        case "GTE":
            return left >= right;

        case "<=":
        case "LTE":
            return left <= right;

        case "==":
        case "EQ":
            return left == right;

        case "!=":
        case "NEQ":
            return left != right;

        default:
            return false;
    }
}


// =====================================
// EVALUATE SINGLE CONDITION
// =====================================

function evaluateCondition(condition, sensorData) {

    if (!condition || !condition.sensor) {

        return {
            valid: false,
            result: false,
            message: "Invalid condition"
        };
    }

    const sensorValue =
        sensorData[condition.sensor];

    if (
        sensorValue === null ||
        sensorValue === undefined ||
        Number.isNaN(Number(sensorValue))
    ) {

        return {
            valid: false,
            result: false,
            message:
                `${condition.sensor} sensor unavailable`
        };
    }

    const result =
        compareValues(
            Number(sensorValue),
            condition.operator,
            Number(condition.value)
        );

    return {
        valid: true,
        result: result,
        message:
            `${sensorValue} ${condition.operator} ` +
            `${condition.value} = ${result}`
    };
}


// =====================================
// EVALUATE CONDITIONS
// =====================================

function evaluateConditions(conditions, sensorData) {

    if (!conditions) {

        return {
            valid: false,
            result: false,
            message: "No conditions found"
        };
    }


    // =================================
    // ARRAY FORMAT = AND
    // =================================

    if (Array.isArray(conditions)) {

        if (conditions.length === 0) {

            return {
                valid: false,
                result: false,
                message: "No conditions found"
            };
        }

        const results = [];

        for (const condition of conditions) {

            const result =
                evaluateCondition(
                    condition,
                    sensorData
                );

            results.push(result);

            if (!result.valid) {

                return {
                    valid: false,
                    result: false,
                    details: results
                };
            }
        }

        return {
            valid: true,
            result: results.every(
                item => item.result === true
            ),
            details: results
        };
    }


    // =================================
    // AND / OR GROUP
    // =================================

    if (
        conditions.type === "AND" ||
        conditions.type === "OR"
    ) {

        const childConditions =
            conditions.conditions;

        if (
            !Array.isArray(childConditions) ||
            childConditions.length === 0
        ) {

            return {
                valid: false,
                result: false,
                message: "Condition group is empty"
            };
        }

        const results = [];

        for (const condition of childConditions) {

            const result =
                evaluateConditions(
                    condition,
                    sensorData
                );

            results.push(result);

            if (!result.valid) {

                return {
                    valid: false,
                    result: false,
                    details: results
                };
            }
        }

        let finalResult;

        if (conditions.type === "AND") {

            finalResult =
                results.every(
                    item => item.result === true
                );

        } else {

            finalResult =
                results.some(
                    item => item.result === true
                );
        }

        return {
            valid: true,
            result: finalResult,
            type: conditions.type,
            details: results
        };
    }


    // =================================
    // SINGLE CONDITION
    // =================================

    if (conditions.type === "condition") {

        return evaluateCondition(
            conditions,
            sensorData
        );
    }


    return {
        valid: false,
        result: false,
        message: "Invalid condition format"
    };
}


// =====================================
// EXECUTE ACTION
// =====================================

function executeAction(action) {

    if (!action || !action.type) {

        return {
            success: false,
            message: "Invalid action"
        };
    }


    // =================================
    // WATER PUMP
    // =================================

    if (action.type === "pump") {

        const state =
            action.value === true;

        return {
            success: true,
            type: "pump",
            value: state,
            message: state
                ? "Water Pump ON"
                : "Water Pump OFF"
        };
    }


    // =================================
    // VENTILATION
    // =================================

    if (action.type === "ventilation") {

        const angle =
            Number(action.angle);

        if (Number.isNaN(angle)) {

            return {
                success: false,
                message:
                    "Invalid ventilation angle"
            };
        }

        if (angle < 0 || angle > 90) {

            return {
                success: false,
                message:
                    "Ventilation angle must be between 0 and 90 degrees"
            };
        }

        return {
            success: true,
            type: "ventilation",
            angle: angle,
            message:
                `Ventilation Window set to ${angle}°`
        };
    }


    return {
        success: false,
        message:
            `Unknown action type: ${action.type}`
    };
}


// =====================================
// EVALUATE ONE RULE
// =====================================

function evaluateRule(rule, sensorData) {

    if (!rule) {

        return {
            triggered: false,
            success: false,
            message: "Invalid rule"
        };
    }


    const conditionResult =
        evaluateConditions(
            rule.conditions,
            sensorData
        );


    if (!conditionResult.valid) {

        return {
            triggered: false,
            success: false,
            message:
                "Rule could not be evaluated",
            details: conditionResult
        };
    }


    if (!conditionResult.result) {

        return {
            triggered: false,
            success: true,
            message:
                "Conditions are false",
            details: conditionResult
        };
    }


    const actionResult =
        executeAction(
            rule.action
        );


    return {
        triggered: true,
        success: actionResult.success,
        message: actionResult.message,
        action: actionResult,
        details: conditionResult
    };
}


// =====================================
// EVALUATE MULTIPLE RULES
// =====================================

function evaluateRules(rules, sensorData) {

    if (!Array.isArray(rules)) {

        return [];
    }

    return rules.map(rule =>
        evaluateRule(
            rule,
            sensorData
        )
    );
}


// =====================================
// CONTINUOUS RULE RUNTIME
// =====================================

let ruleRuntimeInterval = null;


function startRuleRuntime(
    ruleData,
    sensorProvider,
    callback
) {

    stopRuleRuntime();

    if (
        !ruleData ||
        !Array.isArray(ruleData.rules)
    ) {

        console.error(
            "Invalid rule data"
        );

        return;
    }


    runRuntimeCycle(
        ruleData,
        sensorProvider,
        callback
    );


    ruleRuntimeInterval =
        setInterval(function () {

            runRuntimeCycle(
                ruleData,
                sensorProvider,
                callback
            );

        }, 1000);
}


// =====================================
// ONE RUNTIME CYCLE
// =====================================

function runRuntimeCycle(
    ruleData,
    sensorProvider,
    callback
) {

    const currentSensorData =
        typeof sensorProvider === "function"
            ? sensorProvider()
            : sensorProvider;


    const results =
        evaluateRules(
            ruleData.rules,
            currentSensorData
        );


    if (typeof callback === "function") {

        callback(
            results,
            currentSensorData
        );
    }


    console.log(
        "Runtime Sensor Data:",
        currentSensorData
    );


    console.log(
        "Runtime Rule Results:",
        results
    );
}


// =====================================
// STOP RULE RUNTIME
// =====================================

function stopRuleRuntime() {

    if (ruleRuntimeInterval !== null) {

        clearInterval(
            ruleRuntimeInterval
        );

        ruleRuntimeInterval = null;

        console.log(
            "Rule Runtime Stopped"
        );
    }
}