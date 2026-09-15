// =====================================
// SMART GREENHOUSE AUTOMATION APP
// =====================================

console.log("Smart Greenhouse App Started");


// =====================================
// SENSOR DATA
// =====================================

let sensorData = {
    temperature: 32,
    humidity: 65,
    soilMoisture: 25
};


// =====================================
// TOOLBOX
// =====================================

const toolbox = {
    kind: "flyoutToolbox",

    contents: [

        // Logic
        {
            kind: "block",
            type: "controls_if"
        },

        {
            kind: "block",
            type: "logic_compare"
        },

        {
            kind: "block",
            type: "logic_operation"
        },

        // Number
        {
            kind: "block",
            type: "math_number"
        },

        // Sensors
        {
            kind: "block",
            type: "get_temperature"
        },

        {
            kind: "block",
            type: "get_humidity"
        },

        {
            kind: "block",
            type: "get_soil_moisture"
        },

        // Actuators
        {
            kind: "block",
            type: "water_pump"
        },

        {
            kind: "block",
            type: "set_ventilation"
        }
    ]
};


// =====================================
// CREATE BLOCKLY WORKSPACE
// =====================================

const workspace = Blockly.inject("blocklyDiv", {
    toolbox: toolbox,
    scrollbars: true,
    trashcan: true
});

console.log("Blockly workspace initialized");


// =====================================
// UPDATE SENSOR DASHBOARD
// =====================================

function updateDashboard() {

    document.getElementById("temperature").textContent =
        sensorData.temperature + " °C";

    document.getElementById("humidity").textContent =
        sensorData.humidity + " %";

    document.getElementById("soilMoisture").textContent =
        sensorData.soilMoisture + " %";
}

updateDashboard();


// =====================================
// SENSOR ERROR TEST CONTROLS
// =====================================

function createSensorTestControls() {

    if (document.getElementById("sensorTestControls")) {
        return;
    }

    const controls =
        document.createElement("div");

    controls.id =
        "sensorTestControls";

    controls.style.marginTop =
        "12px";

    controls.innerHTML = `
        <button id="sensorFailureBtn" type="button">
            Test Sensor Failure
        </button>

        <button id="resetSensorBtn" type="button">
            Reset Sensors
        </button>
    `;

    const output =
        document.getElementById("output");

    if (
        output &&
        output.parentElement
    ) {

        output.parentElement.insertBefore(
            controls,
            output
        );

    } else {

        document.body.appendChild(
            controls
        );
    }


    // SENSOR FAILURE
    document
        .getElementById("sensorFailureBtn")
        .addEventListener(
            "click",
            function () {

                sensorData.temperature =
                    null;

                updateDashboard();

                output.textContent =
                    "⚠️ Sensor Failure Simulated\n\n" +
                    "Temperature sensor is unavailable.\n" +
                    "Rule Engine will safely reject temperature-based rules.";

                console.log(
                    "Sensor Failure Simulated:",
                    sensorData
                );
            }
        );


    // RESET SENSOR
    document
        .getElementById("resetSensorBtn")
        .addEventListener(
            "click",
            function () {

                sensorData = {
                    temperature: 32,
                    humidity: 65,
                    soilMoisture: 25
                };

                updateDashboard();

                output.textContent =
                    "✅ Sensors Reset\n\n" +
                    JSON.stringify(
                        sensorData,
                        null,
                        2
                    );

                console.log(
                    "Sensors Reset:",
                    sensorData
                );
            }
        );
}

createSensorTestControls();


// =====================================
// COMPILE LOGIC
// =====================================

document
    .getElementById("compileBtn")
    .addEventListener(
        "click",
        function () {

            const output =
                document.getElementById(
                    "output"
                );

            try {

                const ruleData =
                    workspaceToRules();


                if (
                    !ruleData ||
                    !Array.isArray(
                        ruleData.rules
                    ) ||
                    ruleData.rules.length === 0
                ) {

                    output.textContent =
                        "❌ Compilation Failed\n\n" +
                        "No valid Blockly rule found.\n\n" +
                        "Create an IF condition with an action.";

                    return;
                }


                output.textContent =
                    "✅ Compilation Successful\n\n" +
                    "Structured JSON Rule:\n\n" +
                    JSON.stringify(
                        ruleData,
                        null,
                        2
                    );


                console.log(
                    "Generated Rule:",
                    ruleData
                );

            }

            catch (error) {

                console.error(error);

                output.textContent =
                    "❌ Compilation Failed\n\n" +
                    error.message;
            }

        }
    );


// =====================================
// VALIDATE LOGIC
// =====================================

document
    .getElementById("validateBtn")
    .addEventListener(
        "click",
        function () {

            const output =
                document.getElementById(
                    "output"
                );

            try {

                const ruleData =
                    workspaceToRules();


                if (
                    !ruleData ||
                    !Array.isArray(
                        ruleData.rules
                    ) ||
                    ruleData.rules.length === 0
                ) {

                    output.textContent =
                        "❌ Validation Failed\n\n" +
                        "No valid Blockly rule found.";

                    return;
                }


                // Use validator.js

                if (
                    typeof validateRules ===
                    "function"
                ) {

                    const validationResult =
                        validateRules(
                            ruleData
                        );


                    if (
                        validationResult === false ||
                        (
                            validationResult &&
                            validationResult.valid === false
                        )
                    ) {

                        output.textContent =
                            "❌ Validation Failed\n\n" +
                            JSON.stringify(
                                validationResult,
                                null,
                                2
                            );

                        return;
                    }
                }


                output.textContent =
                    "✅ Validation Successful\n\n" +
                    "Rules are valid and ready for the Rule Engine.\n\n" +
                    JSON.stringify(
                        ruleData,
                        null,
                        2
                    );

            }

            catch (error) {

                console.error(error);

                output.textContent =
                    "❌ Validation Error\n\n" +
                    error.message;
            }

        }
    );


// =====================================
// EXECUTE DASHBOARD ACTION
// =====================================

function executeDashboardAction(action) {

    if (!action) {
        return;
    }


    // =================================
    // WATER PUMP
    // =================================

    if (action.type === "pump") {

        const pumpStatus =
            document.getElementById(
                "pumpStatus"
            );


        if (action.value === true) {

            pumpStatus.textContent =
                "ON";

            pumpStatus.classList.remove(
                "off"
            );

            pumpStatus.classList.add(
                "on"
            );

        }

        else {

            pumpStatus.textContent =
                "OFF";

            pumpStatus.classList.remove(
                "on"
            );

            pumpStatus.classList.add(
                "off"
            );
        }
    }


    // =================================
    // VENTILATION WINDOW
    // =================================

    if (action.type === "ventilation") {

        let angle =
            Number(
                action.angle
            );


        // Safety limit: 0–90 degrees

        angle = Math.max(
            0,
            Math.min(
                90,
                angle
            )
        );


        document.getElementById(
            "windowAngle"
        ).textContent =
            angle + "°";
    }
}


// =====================================
// RUN RULE ENGINE ONCE
// =====================================

function runRuleEngine(ruleData) {

    const executedActions = [];


    if (
        !ruleData ||
        !Array.isArray(
            ruleData.rules
        )
    ) {

        return executedActions;
    }


    // Evaluate all rules

    const results =
        evaluateRules(
            ruleData.rules,
            sensorData
        );


    console.log(
        "Rule Engine Results:",
        results
    );


    // Process results

    results.forEach(
        function (result) {

            console.log(
                "Rule Result:",
                result
            );


            // Rule triggered

            if (
                result.triggered === true &&
                result.success === true &&
                result.action
            ) {

                const action =
                    result.action;


                // Update dashboard

                executeDashboardAction(
                    action
                );


                executedActions.push(
                    action
                );
            }
        }
    );


    return executedActions;
}


// =====================================
// CONTINUOUS RULE RUNTIME
// =====================================

let runtimeActive =
    false;


// =====================================
// START CONTINUOUS RUNTIME
// =====================================

function startGreenhouseRuntime(
    ruleData
) {

    if (runtimeActive) {

        console.log(
            "Runtime already running"
        );

        return;
    }


    runtimeActive =
        true;


    startRuleRuntime(

        ruleData,

        // Sensor provider

        function () {

            return sensorData;
        },


        // Runtime callback

        function (
            results,
            currentSensorData
        ) {

            console.log(
                "Live Sensor Data:",
                currentSensorData
            );


            console.log(
                "Live Rule Results:",
                results
            );


            // Execute triggered actions

            results.forEach(
                function (result) {

                    if (
                        result.triggered === true &&
                        result.success === true &&
                        result.action
                    ) {

                        executeDashboardAction(
                            result.action
                        );
                    }
                }
            );
        }
    );


    console.log(
        "🌱 Greenhouse Runtime Started"
    );
}


// =====================================
// STOP CONTINUOUS RUNTIME
// =====================================

function stopGreenhouseRuntime() {

    stopRuleRuntime();

    runtimeActive =
        false;

    console.log(
        "🌱 Greenhouse Runtime Stopped"
    );
}


// =====================================
// DEPLOY LOGIC
// =====================================

document
    .getElementById("deployBtn")
    .addEventListener(
        "click",
        function () {

            const output =
                document.getElementById(
                    "output"
                );


            try {

                // =================================
                // CREATE RULE DATA
                // =================================

                const ruleData =
                    workspaceToRules();


                // =================================
                // EMPTY RULE CHECK
                // =================================

                if (
                    !ruleData ||
                    !Array.isArray(
                        ruleData.rules
                    ) ||
                    ruleData.rules.length === 0
                ) {

                    output.textContent =
                        "❌ Deployment Failed\n\n" +
                        "Please create a Blockly rule first.";

                    return;
                }


                // =================================
                // VALIDATE RULES
                // =================================

                if (
                    typeof validateRules ===
                    "function"
                ) {

                    const validationResult =
                        validateRules(
                            ruleData
                        );


                    if (
                        validationResult === false ||
                        (
                            validationResult &&
                            validationResult.valid === false
                        )
                    ) {

                        output.textContent =
                            "❌ Deployment Failed\n\n" +
                            "Rule validation failed.";

                        return;
                    }
                }


                // =================================
                // RUN ONCE
                // =================================

                const actions =
                    runRuleEngine(
                        ruleData
                    );


                // =================================
                // START CONTINUOUS RUNTIME
                // =================================

                startGreenhouseRuntime(
                    ruleData
                );


                // =================================
                // OUTPUT
                // =================================

                output.textContent =
                    "🚀 Logic Deployment Successful\n\n" +

                    "Rule Engine Started.\n" +

                    "Rules are being evaluated continuously.\n\n" +

                    "Sensor Data:\n" +

                    JSON.stringify(
                        sensorData,
                        null,
                        2
                    ) +

                    "\n\nExecuted Actions:\n" +

                    JSON.stringify(
                        actions,
                        null,
                        2
                    );


                console.log(
                    "Deployment completed"
                );

            }

            catch (error) {

                console.error(error);

                output.textContent =
                    "❌ Deployment Failed\n\n" +
                    error.message;
            }

        }
    );