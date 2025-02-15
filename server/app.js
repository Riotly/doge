const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dogeRoutes = require("./routes/dogeRoutes");

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

// Routes
app.use("/api/doge", dogeRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});