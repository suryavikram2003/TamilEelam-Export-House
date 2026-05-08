/**
 * Real-time Commodity Price API Integration
 * Fetches live spice prices from government APIs
 * 
 * Sources:
 * 1. CEDA API: https://api.ceda.ashoka.edu.in (Agmarknet aggregator)
 * 2. data.gov.in: https://data.gov.in (Official government platform)
 */

const axios = require('axios');

// Mapping of spice names to API commodity codes
const SPICE_MAPPING = {
  'Black Pepper': 'Black Pepper',
  'White Pepper': 'White Pepper',
  'Red Chilli (Whole)': 'Chilli',
  'Kashmiri Chilli': 'Chilli',
  'Turmeric (Whole)': 'Turmeric',
  'Turmeric Powder': 'Turmeric',
  'Cumin Seeds': 'Cumin',
  'Coriander Seeds': 'Coriander',
  'Coriander Powder': 'Coriander',
  'Cardamom (Green)': 'Cardamom',
  'Cardamom (Black)': 'Cardamom',
  'Cloves': 'Cloves',
  'Cinnamon': 'Cinnamon',
  'Fennel Seeds': 'Fennel',
  'Fenugreek Seeds': 'Fenugreek',
  'Mustard Seeds': 'Mustard',
  'Nutmeg': 'Nutmeg',
  'Mace': 'Mace',
  'Asafoetida (Hing)': 'Asafoetida',
  'Garlic (Dry)': 'Garlic',
  'Ginger (Dry)': 'Ginger',
  'Tamarind': 'Tamarind',
  'Star Anise': 'Star Anise',
  'Sesame Seeds': 'Sesame',
  'Poppy Seeds': 'Poppy',
  'Carom Seeds (Ajwain)': 'Ajwain',
  'Black Cumin (Kalonji)': 'Cumin',
};

/**
 * Fetch current commodity price from CEDA API
 * @param {string} commodityName - Name of the spice/commodity
 * @returns {Promise<Object>} Price data with modal_price, min_price, max_price, etc.
 */
async function fetchCEDAPrice(commodityName) {
  try {
    const commodity = SPICE_MAPPING[commodityName] || commodityName;
    
    // Try CEDA API endpoint
    const cedaEndpoints = [
      `https://api.ceda.ashoka.edu.in/api/v1/prices?commodity=${encodeURIComponent(commodity)}`,
      `https://api.ceda.ashoka.edu.in/api/prices?commodity=${encodeURIComponent(commodity)}`,
      `https://ashoka.edu.in/api/v1/prices?commodity=${encodeURIComponent(commodity)}`,
    ];

    for (const endpoint of cedaEndpoints) {
      try {
        const response = await axios.get(endpoint, { 
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.status === 200 && response.data) {
          console.log(`[CEDA] Found price for ${commodityName}:`, response.data);
          return {
            source: 'CEDA',
            commodity: commodityName,
            modalPrice: response.data.modal_price || response.data.price,
            minPrice: response.data.min_price,
            maxPrice: response.data.max_price,
            unit: response.data.unit || 'kg',
            date: response.data.date,
            market: response.data.market,
            rawData: response.data
          };
        }
      } catch (e) {
        // Try next endpoint
        continue;
      }
    }
  } catch (error) {
    console.error(`[CEDA] Error fetching ${commodityName}:`, error.message);
  }
  
  return null;
}

/**
 * Fetch current commodity price from data.gov.in
 * @param {string} commodityName - Name of the spice/commodity
 * @param {string} apiKey - API key for data.gov.in
 * @returns {Promise<Object>} Price data
 */
async function fetchDataGovPrice(commodityName, apiKey) {
  try {
    // Main government commodity price dataset
    const resourceIds = [
      '9ef84268-d588-465a-a5c0-3b405fcc2df8', // Current Daily Price
      '4d00226d-2c64-4efd-83a1-c03919cd5b88',
      '5a0c3f19-3f51-4aa9-95e6-cb4248c0e84a',
    ];

    for (const resourceId of resourceIds) {
      try {
        const endpoint = `https://data.gov.in/api/datastore_search`;
        const params = {
          resource_id: resourceId,
          filters: { commodity: commodityName },
          limit: 5,
          sort: '_id desc'
        };

        if (apiKey) {
          params['api-key'] = apiKey;
        }

        const response = await axios.get(endpoint, { 
          params,
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.status === 200 && response.data.records && response.data.records.length > 0) {
          const latestRecord = response.data.records[0];
          console.log(`[DataGov] Found price for ${commodityName}:`, latestRecord);
          
          return {
            source: 'DataGov',
            commodity: commodityName,
            modalPrice: latestRecord.modal_price || latestRecord.price,
            minPrice: latestRecord.min_price,
            maxPrice: latestRecord.max_price,
            unit: latestRecord.unit || 'kg',
            date: latestRecord.date,
            market: latestRecord.market || latestRecord.mandi,
            state: latestRecord.state,
            variety: latestRecord.variety,
            rawData: latestRecord
          };
        }
      } catch (e) {
        // Try next resource ID
        continue;
      }
    }
  } catch (error) {
    console.error(`[DataGov] Error fetching ${commodityName}:`, error.message);
  }

  return null;
}

/**
 * Fetch price from multiple sources with fallback
 * @param {string} commodityName - Name of the spice/commodity
 * @param {string} apiKey - Optional API key for data.gov.in
 * @returns {Promise<Object>} Price data from first successful source
 */
async function fetchCommodityPrice(commodityName, apiKey = null) {
  try {
    // Try CEDA first (faster, more structured)
    const cedaPrice = await fetchCEDAPrice(commodityName);
    if (cedaPrice) return cedaPrice;

    // Fallback to data.gov.in
    if (apiKey) {
      const govPrice = await fetchDataGovPrice(commodityName, apiKey);
      if (govPrice) return govPrice;
    }

    return {
      error: `Could not fetch price for ${commodityName}`,
      commodity: commodityName,
      source: 'none'
    };
  } catch (error) {
    console.error(`Error fetching price for ${commodityName}:`, error);
    return {
      error: error.message,
      commodity: commodityName
    };
  }
}

/**
 * Batch fetch prices for multiple commodities
 * @param {Array<string>} commodityNames - Array of spice names
 * @param {string} apiKey - Optional API key
 * @returns {Promise<Object>} Object with commodity prices
 */
async function fetchBulkPrices(commodityNames, apiKey = null) {
  const prices = {};
  const promises = commodityNames.map(async (name) => {
    const price = await fetchCommodityPrice(name, apiKey);
    prices[name] = price;
  });

  await Promise.all(promises);
  return prices;
}

/**
 * Get list of all available commodities from CEDA API
 * @returns {Promise<Array>} List of available commodities
 */
async function getAvailableCommodities() {
  try {
    const endpoints = [
      'https://api.ceda.ashoka.edu.in/api/v1/commodities',
      'https://api.ceda.ashoka.edu.in/api/commodities',
      'https://ashoka.edu.in/api/v1/commodities',
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 5000 });
        if (response.status === 200 && response.data) {
          return Array.isArray(response.data) ? response.data : response.data.commodities || [];
        }
      } catch (e) {
        continue;
      }
    }
  } catch (error) {
    console.error('Error fetching commodities list:', error.message);
  }

  return [];
}

module.exports = {
  fetchCEDAPrice,
  fetchDataGovPrice,
  fetchCommodityPrice,
  fetchBulkPrices,
  getAvailableCommodities,
  SPICE_MAPPING
};
