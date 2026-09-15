const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Smart Greenhouse Server is Running");
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({
    server: server
});

// WebSocket connection
wss.on("connection", (socket) => {

    console.log("WebSocket client connected");

    // Send welcome message
    socket.send(
        JSON.stringify({
            type: "connection",
            message: "Connected to Smart Greenhouse Server"
        })
    );

    // Receive message
    socket.on("message", (message) => {
        console.log("Received:", message.toString());
    });

    // Client disconnected
    socket.on("close", () => {
        console.log("WebSocket client disconnected");
    });
});

// Server port
const PORT = 3000;

server.listen(PORT, () => {
    console.log(
        `Smart Greenhouse Server running on http://localhost:${PORT}`
    );
});