/**
 * Real-time Commodity Price API Integration
 * Fetches live spice prices from government APIs
 * 
 * Sources:
 * 1. CEDA API: https://api.ceda.ashoka.edu.in (Agmarknet aggregator)
 * 2. data.gov.in: https://data.gov.in (Official government platform)
 */

const axios = require('axios');

const REQUEST_TIMEOUT_MS = 5000;

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function toFiniteNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function pickFirstDefined(record, keys) {
  for (const key of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, key) && record[key] !== undefined && record[key] !== null && record[key] !== '') {
      return record[key];
    }
  }
  return undefined;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildCommodityCandidates(commodityName) {
  const normalized = normalizeText(commodityName);
  const mappedCommodity = SPICE_MAPPING[normalized];
  const lowerNormalized = normalized.toLowerCase();

  const reverseMatch = Object.entries(SPICE_MAPPING).find(([productName, commodity]) => {
    return productName.toLowerCase() === lowerNormalized || commodity.toLowerCase() === lowerNormalized;
  });

  return uniqueValues([
    normalized,
    mappedCommodity,
    reverseMatch?.[0],
    reverseMatch?.[1]
  ]);
}

function extractFirstRecord(payload) {
  if (!payload) return null;

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  if (Array.isArray(payload.records)) {
    return payload.records[0] || null;
  }

  if (payload.result) {
    const resultRecord = extractFirstRecord(payload.result);
    if (resultRecord) return resultRecord;
  }

  if (payload.data) {
    const dataRecord = extractFirstRecord(payload.data);
    if (dataRecord) return dataRecord;
  }

  return typeof payload === 'object' ? payload : null;
}

function normalizePriceRecord(source, commodityName, record) {
  const modalPrice = toFiniteNumber(
    pickFirstDefined(record, ['modal_price', 'modalPrice', 'modal price', 'price', 'rate', 'value'])
  );
  const minPrice = toFiniteNumber(
    pickFirstDefined(record, ['min_price', 'minPrice', 'minimum_price', 'minimumPrice'])
  );
  const maxPrice = toFiniteNumber(
    pickFirstDefined(record, ['max_price', 'maxPrice', 'maximum_price', 'maximumPrice'])
  );

  return {
    source,
    commodity: normalizeText(commodityName),
    mappedCommodity: SPICE_MAPPING[normalizeText(commodityName)] || normalizeText(commodityName),
    modalPrice,
    minPrice,
    maxPrice,
    unit: pickFirstDefined(record, ['unit', 'units', 'uom']) || 'kg',
    date: pickFirstDefined(record, ['date', 'date_of_price', 'price_date', 'updated_at']),
    market: pickFirstDefined(record, ['market', 'mandi', 'market_name', 'location']),
    state: pickFirstDefined(record, ['state', 'state_name']),
    variety: pickFirstDefined(record, ['variety', 'commodity_variety', 'grade']),
    rawData: record
  };
}

async function requestJson(url, options = {}) {
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT_MS,
    headers: { 'User-Agent': 'Mozilla/5.0' },
    validateStatus: status => status >= 200 && status < 500,
    ...options
  });

  return response;
}

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
    const commodityCandidates = buildCommodityCandidates(commodityName);
    const cedaEndpoints = commodityCandidates.flatMap(candidate => [
      `https://api.ceda.ashoka.edu.in/api/v1/prices?commodity=${encodeURIComponent(candidate)}`,
      `https://api.ceda.ashoka.edu.in/api/prices?commodity=${encodeURIComponent(candidate)}`,
      `https://ashoka.edu.in/api/v1/prices?commodity=${encodeURIComponent(candidate)}`
    ]);

    for (const endpoint of cedaEndpoints) {
      try {
        const response = await requestJson(endpoint);
        if (response.status >= 200 && response.status < 300 && response.data) {
          const record = extractFirstRecord(response.data);
          if (!record) continue;

          const normalized = normalizePriceRecord('CEDA', commodityName, record);
          if (normalized.modalPrice || normalized.minPrice || normalized.maxPrice) {
            console.log(`[CEDA] Found price for ${commodityName}:`, normalized.rawData);
            return normalized;
          }
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
          filters: { commodity: normalizeText(commodityName) },
          limit: 5,
          sort: '_id desc'
        };

        if (apiKey) {
          params['api-key'] = apiKey;
          params.api_key = apiKey;
        }

        const response = await requestJson(endpoint, { params });
        if (response.status >= 200 && response.status < 300 && response.data) {
          const latestRecord = extractFirstRecord(response.data);
          if (!latestRecord) continue;

          const normalized = normalizePriceRecord('DataGov', commodityName, latestRecord);
          if (normalized.modalPrice || normalized.minPrice || normalized.maxPrice) {
            console.log(`[DataGov] Found price for ${commodityName}:`, normalized.rawData);
            return normalized;
          }
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
    const normalizedName = normalizeText(commodityName);

    // Try CEDA first (faster, more structured)
    const cedaPrice = await fetchCEDAPrice(normalizedName);
    if (cedaPrice) return cedaPrice;

    // Fallback to data.gov.in
    if (apiKey) {
      const govPrice = await fetchDataGovPrice(normalizedName, apiKey);
      if (govPrice) return govPrice;
    }

    return {
      error: `Could not fetch price for ${normalizedName}`,
      commodity: normalizedName,
      source: 'none'
    };
  } catch (error) {
    console.error(`Error fetching price for ${commodityName}:`, error);
    return {
      error: error.message,
      commodity: normalizeText(commodityName)
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
  const queue = [...new Set((commodityNames || []).map(name => normalizeText(name)).filter(Boolean))];
  await Promise.all(queue.map(async (name) => {
    prices[name] = await fetchCommodityPrice(name, apiKey);
  }));
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
        const response = await requestJson(endpoint);
        if (response.status >= 200 && response.status < 300 && response.data) {
          const commodities = response.data.commodities || response.data.data || response.data.result || response.data;
          if (Array.isArray(commodities)) {
            return commodities;
          }

          if (commodities && Array.isArray(commodities.records)) {
            return commodities.records;
          }
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
