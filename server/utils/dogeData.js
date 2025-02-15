const axios = require("axios");

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins/dogecoin/market_chart?vs_currency=inr&days=1&interval=minute";
let lastRequestTime = 0;
const REQUEST_DELAY = 3000; // 1 second delay between requests
const MAX_RETRIES = 3; // Maximum number of retries
const CACHE_DURATION = 60000; // Cache data for 1 minute

let cachedData = null;
let cacheTimestamp = 0;

async function fetchDogeData(retries = 0) {
    try {
        // Return cached data if it's still valid
        if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
            return cachedData;
        }

        // Throttle requests
        const now = Date.now();
        if (now - lastRequestTime < REQUEST_DELAY) {
            await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY - (now - lastRequestTime)));
        }
        lastRequestTime = Date.now();

        const response = await axios.get(COINGECKO_API_URL);
        const data = response.data;
        cachedData = {
            prices: data.prices.map((price) => price[1]), // Extract prices
            timestamps: data.prices.map((price) => new Date(price[0]).toLocaleTimeString()), // Extract timestamps
            current_price: data.prices[data.prices.length - 1][1], // Latest price
        };
        cacheTimestamp = Date.now();
        return cachedData;
    } catch (err) {
        if (retries < MAX_RETRIES) {
            console.warn(`Retrying request (${retries + 1}/${MAX_RETRIES})...`);
            return fetchDogeData(retries + 1);
        } else {
            console.error("Failed to fetch DOGE data after retries:", err);
            throw err;
        }
    }
}

module.exports = { fetchDogeData };