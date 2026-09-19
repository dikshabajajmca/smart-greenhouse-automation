# 🌱 Smart Greenhouse Automation System

A No-Code IoT Smart Greenhouse Automation System that combines Blockly-based rule creation, ESP32 simulation using Wokwi, real-time telemetry, JavaScript rule evaluation, and automated greenhouse control.

## Project Overview

The Smart Greenhouse Automation System allows users to create greenhouse automation rules using Blockly blocks without writing code.

The system receives live sensor data from the Wokwi ESP32 simulation and evaluates the configured rules using a JavaScript Rule Engine.

Based on the rule conditions, commands can be sent back to the simulated greenhouse actuators.

## Features

- Blockly-based no-code rule creation
- ESP32 simulation using Wokwi
- Temperature monitoring
- Humidity monitoring
- Soil moisture monitoring
- Automatic water pump control
- Automatic ventilation control
- Real-time telemetry
- Browser-to-Wokwi commands
- Blockly to JSON rule generation
- Rule validation
- Conflicting rule detection
- Sensor failure handling
- Safe mode
- Network disconnect handling
- Deploy Logic
- Continuous rule evaluation

## Technology Stack

### Frontend
- HTML
- CSS
- JavaScript
- Blockly

### Backend
- Node.js
- Express.js
- WebSocket
- CORS

### IoT Simulation
- ESP32
- MicroPython
- Wokwi
- DHT22
- Potentiometer
- OLED
- Relay
- Servo

## How the System Works

The system follows this flow:

Blockly Rules
↓
Compile
↓
JSON Rules
↓
Validation
↓
Deploy Logic
↓
JavaScript Rule Engine
↓
Live Sensor Data
↓
Command
↓
Wokwi ESP32

## System Architecture

```text
                ┌──────────────────┐
                │      Wokwi       │
                │ ESP32 + Sensors  │
                │ DHT22 + Soil     │
                │ Servo + Relay    │
                └────────┬─────────┘
                         │
                     Telemetry
                         ↓
                ┌──────────────────┐
                │     Node.js      │
                │ WebSocket Server │
                └────────┬─────────┘
                         │
                         ↓
                ┌──────────────────┐
                │     Browser      │
                │ Blockly + UI     │
                └────────┬─────────┘
                         │
                       Rules
                         ↓
                ┌──────────────────┐
                │   Rule Engine    │
                │   Validation     │
                └────────┬─────────┘
                         │
                     Commands
                         ↓
                ┌──────────────────┐
                │      Wokwi       │
                │    Actuators     │
                │ Relay + Servo    │
                └──────────────────┘