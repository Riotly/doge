const Alert = require("../models/alert");

async function getAlerts() {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });
        return alerts;
    } catch (err) {
        console.error("Failed to fetch alerts:", err);
        throw err;
    }
}

async function addAlert(price, type) {
    try {
        const alert = new Alert({ price, type });
        await alert.save();
        return alert;
    } catch (err) {
        console.error("Failed to add alert:", err);
        throw err;
    }
}

module.exports = { getAlerts, addAlert };