const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    price: { type: Number, required: true },
    type: { type: String, enum: ["above", "below"], required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alert", alertSchema);