import { Chart } from "chart.js";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";

// Register the candlestick controller and element
Chart.register(CandlestickController, CandlestickElement);

document.addEventListener("DOMContentLoaded", () => {
    // Initialize the candlestick chart
    const ctx = document.getElementById("dogeChart").getContext("2d");
    const chart = new Chart(ctx, {
        type: "candlestick",
        data: {
            datasets: [{
                label: "DOGE/INR",
                data: [], // Candlestick data (OHLC)
                color: {
                    up: "green", // Color for bullish candles
                    down: "red", // Color for bearish candles
                    unchanged: "gray", // Color for neutral candles
                },
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "minute",
                        displayFormats: {
                            minute: "HH:mm",
                        },
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Price (INR)",
                    },
                    grid: {
                        color: "#e0e0e0",
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
                tooltip: {
                    enabled: true,
                    mode: "index",
                    intersect: false,
                },
            },
        },
    });

    // Connect to the WebSocket server
    const ws = new WebSocket(`ws://localhost:${window.location.port}`);

    ws.onopen = () => {
        console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "priceUpdate") {
            const { price, timestamp } = message;

            // Simulate OHLC data (for demonstration)
            const ohlc = {
                t: new Date(timestamp).getTime(), // Timestamp
                o: parseFloat(price) - 1, // Open
                h: parseFloat(price) + 1, // High
                l: parseFloat(price) - 1, // Low
                c: parseFloat(price), // Close
            };

            // Add the new candlestick to the chart
            chart.data.datasets[0].data.push(ohlc);

            // Remove the oldest candlestick if there are too many
            if (chart.data.datasets[0].data.length > 60) {
                chart.data.datasets[0].data.shift();
            }

            // Update the chart
            chart.update();

            // Update the live price display
            document.getElementById("dogePrice").textContent = price;
        }
    };

    ws.onclose = () => {
        console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    // Handle window resize to ensure the chart resizes properly
    window.addEventListener("resize", () => {
        chart.resize();
    });
});