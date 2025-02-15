const express = require("express");
const router = express.Router();
const { fetchDogeData } = require("../utils/dogeData");
const { getAlerts, addAlert } = require("../utils/alerts");

// Fetch DOGE Coin data
router.get("/data", async (req, res) => {
    try {
        const data = await fetchDogeData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch DOGE data" });
    }
});

// Fetch price alerts
router.get("/alerts", async (req, res) => {
    try {
        const alerts = await getAlerts();
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
});

// Add a new price alert
router.post("/alerts", async (req, res) => {
    try {
        const { price, type } = req.body;
        const alert = await addAlert(price, type);
        res.json(alert);
    } catch (err) {
        res.status(500).json({ error: "Failed to add alert" });
    }
});

module.exports = router;