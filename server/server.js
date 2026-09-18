const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();
const commandQueue = [];

// Health check
app.get("/", (req, res) => {
    res.send("Smart Greenhouse WebSocket Server is Running");
});

// Wokwi -> Node telemetry
app.post("/telemetry", (req, res) => {
    const telemetry = req.body;

    console.log("📡 Wokwi Telemetry Received:", telemetry);

    broadcast(telemetry);

    res.json({
        success: true,
        message: "Telemetry received"
    });
});

// Wokwi polls this endpoint for commands
app.get("/commands", (req, res) => {
    const commands = [...commandQueue];

    commandQueue.length = 0;

    res.json({
        success: true,
        commands
    });
});

// Broadcast message to browser clients
function broadcast(message) {
    const data = JSON.stringify(message);

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Browser <-> Node WebSocket
wss.on("connection", (socket) => {
    console.log("✅ WebSocket client connected");

    clients.add(socket);

    socket.send(
        JSON.stringify({
            type: "connection",
            message: "Connected to Smart Greenhouse Server"
        })
    );

    socket.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());

            console.log("📨 Received:", data);

            // Browser sends command
            if (data.type === "command") {
                commandQueue.push(data);

                console.log("➡️ Command queued for Wokwi:", data);

                // Also send command to other browser clients
                broadcast(data);

                return;
            }

            // Browser test telemetry
            if (data.type === "telemetry") {
                broadcast(data);
                return;
            }

        } catch (error) {
            console.error("❌ Invalid message:", error.message);
        }
    });

    socket.on("close", () => {
        clients.delete(socket);
        console.log("❌ WebSocket client disconnected");
    });
});

const PORT = 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("🌱 Smart Greenhouse Server running");
    console.log(`HTTP: http://localhost:${PORT}`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
});