// ===============================
// SMART GREENHOUSE BLOCKS
// ===============================

// Temperature Sensor Block
Blockly.Blocks["get_temperature"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Get Temperature");

        this.setOutput(true, "Number");

        this.setColour(230);

        this.setTooltip("Gets the current greenhouse temperature");
    }
};


// Humidity Sensor Block
Blockly.Blocks["get_humidity"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Get Humidity");

        this.setOutput(true, "Number");

        this.setColour(230);

        this.setTooltip("Gets the current greenhouse humidity");
    }
};


// Soil Moisture Sensor Block
Blockly.Blocks["get_soil_moisture"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Get Soil Moisture");

        this.setOutput(true, "Number");

        this.setColour(230);

        this.setTooltip("Gets the current soil moisture");
    }
};


// Water Pump Block
Blockly.Blocks["water_pump"] = {
    init: function () {

        this.appendDummyInput()
            .appendField("Turn Water Pump")
            .appendField(
                new Blockly.FieldDropdown([
                    ["ON", "ON"],
                    ["OFF", "OFF"]
                ]),
                "STATE"
            );

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(120);

        this.setTooltip("Turn the water pump ON or OFF");
    }
};


// Ventilation Window Block
Blockly.Blocks["set_ventilation"] = {
    init: function () {

        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("Set Ventilation Window to");

        this.appendDummyInput()
            .appendField("Degrees");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(60);

        this.setTooltip("Set ventilation window angle from 0 to 90 degrees");
    }
};