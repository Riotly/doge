const axios = require("axios");

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins/dogecoin";

async function fetchDogeData() {
    const response = await axios.get(COINGECKO_API_URL);
    const data = response.data;
    return {
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        price_inr: data.market_data.current_price.inr,
        market_cap_inr: data.market_data.market_cap.inr,
        volume_inr: data.market_data.total_volume.inr,
        price_change_24h: data.market_data.price_change_percentage_24h,
        image: data.image.large,
    };
}

module.exports = fetchDogeData;