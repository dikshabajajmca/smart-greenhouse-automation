// =====================================
// SMART GREENHOUSE AUTOMATION APP
// =====================================

console.log("Smart Greenhouse App Started");

// =====================================
// DAY 5 + DAY 6 - WEBSOCKET & SAFETY
// =====================================

const greenhouseSocket = new WebSocket(
    "ws://localhost:3000"
);

window.greenhouseSocket = greenhouseSocket;


// =====================================
// SENSOR DATA
// =====================================

let sensorData = {
    temperature: 32,
    humidity: 65,
    soilMoisture: 25
};


// =====================================
// SYSTEM STATUS
// =====================================

let sensorFailureTestMode = false;

let systemStatus = {
    wokwi: "CONNECTED",
    sensorFailure: false,
    safeMode: false,
    lastTelemetry: Date.now()
};


// =====================================
// WEBSOCKET OPEN
// =====================================

greenhouseSocket.onopen = function () {

    console.log(
        "✅ Connected to Smart Greenhouse WebSocket Server"
    );

    systemStatus.wokwi = "CONNECTED";

    updateSystemStatus();
};


// =====================================
// WEBSOCKET MESSAGE
// =====================================

greenhouseSocket.onmessage = function (event) {

    try {

        const data = JSON.parse(event.data);

        console.log(
            "📡 WebSocket Message:",
            data
        );


        // =================================
        // CONNECTION MESSAGE
        // =================================

        if (data.type === "connection") {

            systemStatus.wokwi = "CONNECTED";

            updateSystemStatus();

            return;
        }


        // =================================
        // TELEMETRY
        // =================================

        if (data.type === "telemetry") {
            if (sensorFailureTestMode) {

    sensorFailureTestMode = true;

sensorData.temperature = null;

systemStatus.sensorFailure = true;
systemStatus.safeMode = true;
systemStatus.wokwi = "CONNECTED";

updateDashboard();
updateSystemStatus();

output.textContent =
    "⚠️ Sensor Failure Simulated\n\n" +
    "Temperature sensor is unavailable.\n" +
    "Rule Engine will safely reject temperature-based rules.";

console.log(
    "Sensor Failure Test Mode Enabled"
);
    updateDashboard();
    updateSystemStatus();

    console.warn(
        "⚠️ Sensor Failure Test Mode Active"
    );

    return;
}

            systemStatus.lastTelemetry =
                Date.now();

            systemStatus.wokwi =
                "CONNECTED";


            let sensorError = false;


            // =================================
            // TEMPERATURE
            // =================================

            if (
                data.temperature !== undefined &&
                data.temperature !== null &&
                Number.isFinite(
                    Number(data.temperature)
                )
            ) {

                sensorData.temperature =
                    Number(
                        data.temperature
                    );

            } else {

                sensorData.temperature = null;

                sensorError = true;

                console.warn(
                    "❌ Temperature sensor unavailable"
                );
            }


            // =================================
            // HUMIDITY
            // =================================

            if (
                data.humidity !== undefined &&
                data.humidity !== null &&
                Number.isFinite(
                    Number(data.humidity)
                )
            ) {

                sensorData.humidity =
                    Number(
                        data.humidity
                    );

            } else {

                sensorData.humidity = null;

                sensorError = true;

                console.warn(
                    "❌ Humidity sensor unavailable"
                );
            }


            // =================================
            // SOIL MOISTURE
            // =================================

            if (
                data.soilMoisture !== undefined &&
                data.soilMoisture !== null &&
                Number.isFinite(
                    Number(data.soilMoisture)
                )
            ) {

                sensorData.soilMoisture =
                    Number(
                        data.soilMoisture
                    );

            } else {

                sensorData.soilMoisture = null;

                sensorError = true;

                console.warn(
                    "❌ Soil moisture sensor unavailable"
                );
            }


            // =================================
            // SENSOR SAFETY
            // =================================

            if (sensorError) {

                systemStatus.sensorFailure = true;
                systemStatus.safeMode = true;

                console.warn(
                    "⚠️ Sensor failure detected"
                );

            } else {

                systemStatus.sensorFailure = false;

                systemStatus.safeMode = false;
            }


            updateDashboard();

            updateSystemStatus();


            console.log(
                "🌱 Live Telemetry Updated:",
                sensorData
            );
        }

    }

    catch (error) {

        console.error(
            "❌ Invalid WebSocket message:",
            error
        );
    }
};


// =====================================
// WEBSOCKET ERROR
// =====================================

greenhouseSocket.onerror = function (error) {

    console.error(
        "❌ WebSocket error:",
        error
    );

    systemStatus.wokwi = "OFFLINE";
    systemStatus.safeMode = true;

    updateSystemStatus();
};


// =====================================
// WEBSOCKET CLOSED
// =====================================

greenhouseSocket.onclose = function () {

    console.warn(
        "🔴 WebSocket disconnected"
    );

    systemStatus.wokwi = "OFFLINE";
    systemStatus.safeMode = true;

    updateSystemStatus();
};


// =====================================
// TEST TELEMETRY
// =====================================

function sendTestTelemetry() {

    if (
        greenhouseSocket.readyState !==
        WebSocket.OPEN
    ) {

        console.log(
            "❌ WebSocket is not connected"
        );

        return;
    }


    const telemetry = {

        type: "telemetry",

        temperature: 32,

        humidity: 65,

        soilMoisture: 25
    };


    greenhouseSocket.send(
        JSON.stringify(telemetry)
    );


    console.log(
        "📡 Test telemetry sent:",
        telemetry
    );
}


// =====================================
// TEST TELEMETRY BUTTON
// =====================================

const testTelemetryBtn =
    document.createElement("button");

testTelemetryBtn.textContent =
    "Send Test Telemetry";

testTelemetryBtn.style.margin =
    "10px";


document.body.prepend(
    testTelemetryBtn
);


testTelemetryBtn.addEventListener(
    "click",
    function () {

        sendTestTelemetry();

    }
);


// =====================================
// SYSTEM STATUS UI
// =====================================

function updateSystemStatus() {

    let statusBox =
        document.getElementById(
            "systemStatusBox"
        );


    if (!statusBox) {

        statusBox =
            document.createElement("div");

        statusBox.id =
            "systemStatusBox";

        statusBox.style.margin =
            "10px";

        statusBox.style.padding =
            "15px";

        statusBox.style.border =
            "1px solid #ccc";

        statusBox.style.borderRadius =
            "10px";

        statusBox.style.fontFamily =
            "Arial";

        document.body.prepend(
            statusBox
        );
    }


    const wokwiStatus =
        systemStatus.wokwi === "CONNECTED"
            ? "🟢 Connected"
            : "🔴 Offline";


    const sensorStatus =
        systemStatus.sensorFailure
            ? "🔴 Sensor Error"
            : "🟢 Normal";


    const safeModeStatus =
        systemStatus.safeMode
            ? "🟠 ACTIVE"
            : "🟢 OFF";


    statusBox.innerHTML = `
        <h3>🌱 SYSTEM STATUS</h3>

        <p>
            Wokwi:
            ${wokwiStatus}
        </p>

        <p>
            Sensors:
            ${sensorStatus}
        </p>

        <p>
            Safe Mode:
            ${safeModeStatus}
        </p>

        <p>
            Blockly:
            🟢 Ready
        </p>

        <p>
            Rule Engine:
            ${
                systemStatus.safeMode
                ? "🟠 Paused"
                : "🟢 Running"
            }
        </p>
    `;
}


// =====================================
// TELEMETRY TIMEOUT
// =====================================

setInterval(
    function () {

        const elapsed =
            Date.now() -
            systemStatus.lastTelemetry;


        // 5 seconds without telemetry
        if (elapsed > 5000) {

            systemStatus.wokwi =
                "OFFLINE";

            systemStatus.safeMode =
                true;


            console.warn(
                "⚠️ Simulation disconnected."
            );

            console.warn(
                "⚠️ Actuation paused."
            );


            updateSystemStatus();
        }

    },
    1000
);

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

    if (
        document.getElementById(
            "sensorTestControls"
        )
    ) {
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


    // =====================================
    // SENSOR FAILURE TEST
    // =====================================

    document
        .getElementById("sensorFailureBtn")
        .addEventListener(
            "click",
            function () {

                sensorFailureTestMode =
                    true;

                sensorData.temperature =
                    null;

                systemStatus.sensorFailure =
                    true;

                systemStatus.safeMode =
                    true;

                systemStatus.wokwi =
                    "CONNECTED";

                updateDashboard();
                updateSystemStatus();

                output.textContent =
                    "⚠️ Sensor Failure Simulated\n\n" +
                    "Temperature sensor is unavailable.\n" +
                    "Rule Engine will safely reject temperature-based rules.";

                console.log(
                    "Sensor Failure Test Mode Enabled"
                );
            }
        );


    // =====================================
    // RESET SENSOR
    // =====================================

    document
        .getElementById("resetSensorBtn")
        .addEventListener(
            "click",
            function () {

                sensorFailureTestMode =
                    false;

                sensorData = {
                    temperature: 32,
                    humidity: 65,
                    soilMoisture: 25
                };

                systemStatus.sensorFailure =
                    false;

                systemStatus.safeMode =
                    false;

                systemStatus.wokwi =
                    "CONNECTED";

                systemStatus.lastTelemetry =
                    Date.now();

                updateDashboard();
                updateSystemStatus();

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


// =====================================
// CREATE CONTROLS
// =====================================

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

// =====================================
// EXECUTE DASHBOARD ACTION
// =====================================

function executeDashboardAction(action) {

    if (!action) {
        return;
    }


    // =================================
    // SAFE MODE
    // =================================

    if (systemStatus.safeMode) {

        console.warn(
            "⚠️ Safe Mode active - action blocked:",
            action
        );

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


        if (!pumpStatus) {
            return;
        }


        if (action.value === true) {

            pumpStatus.textContent =
                "ON";

            pumpStatus.classList.remove(
                "off"
            );

            pumpStatus.classList.add(
                "on"
            );

        } else {

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
    // VENTILATION
    // =================================

    if (
        action.type === "ventilation"
    ) {

        let angle =
            Number(
                action.angle
            );


        if (!Number.isFinite(angle)) {

            console.warn(
                "❌ Invalid ventilation angle"
            );

            return;
        }


        // Safety limit
        if (angle < 0) {
            angle = 0;
        }

        if (angle > 90) {
            angle = 90;
        }


        const windowAngle =
            document.getElementById(
                "windowAngle"
            );


        if (windowAngle) {

            windowAngle.textContent =
                angle + "°";
        }
    }
}



// =====================================
// RUN RULE ENGINE ONCE
// =====================================

function runRuleEngine(ruleData) {

        if (systemStatus.safeMode) {

        console.warn(
            "⚠️ Safe Mode active - Rule Engine skipped"
        );

        return [];
    }

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