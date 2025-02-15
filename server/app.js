const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const WebSocket = require("ws");
const axios = require("axios");

// Load environment variables from .env file
dotenv.config({ path: "../.env" });

// Debug: Check if MONGO_URI is loaded
console.log("MONGO_URI:", process.env.MONGO_URI);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static("../public"));

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("New client connected");

    // Send initial data to the client
    ws.send(JSON.stringify({ type: "connected", message: "Welcome to DOGE Coin Tracker!" }));

    // Handle incoming messages from the client
    ws.on("message", (message) => {
        console.log("Received message:", message.toString());
    });

    // Handle client disconnection
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

// Fetch USD to INR conversion rate
let usdToInrRate = 80; // Default rate (fallback)
const fetchUsdToInrRate = async () => {
    try {
        const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
        usdToInrRate = response.data.rates.INR;
        console.log("USD to INR rate:", usdToInrRate);
    } catch (err) {
        console.error("Failed to fetch USD to INR rate:", err);
    }
};

// Fetch the conversion rate initially and every hour
fetchUsdToInrRate();
setInterval(fetchUsdToInrRate, 3600000); // Update every hour

// Connect to Binance WebSocket (DOGE/USDT pair)
const binanceWebSocket = new WebSocket("wss://stream.binance.com:9443/ws/dogeusdt@trade");

binanceWebSocket.on("open", () => {
    console.log("Connected to Binance WebSocket");
});

binanceWebSocket.on("message", (data) => {
    const message = JSON.parse(data);

    if (message.e === "trade") { // Trade event
        const priceUsd = parseFloat(message.p); // Price in USD
        const priceInr = (priceUsd * usdToInrRate).toFixed(2); // Convert to INR
        const timestamp = new Date(message.T).toLocaleTimeString(); // Timestamp

        // Broadcast the price update to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "priceUpdate", price: priceInr, timestamp }));
            }
        });
    }
});

binanceWebSocket.on("close", () => {
    console.log("Disconnected from Binance WebSocket");
});

binanceWebSocket.on("error", (err) => {
    console.error("Binance WebSocket error:", err);
});