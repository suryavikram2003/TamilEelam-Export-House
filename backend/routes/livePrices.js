/**
 * Real-time Commodity Price Routes
 * Endpoints to fetch live spice prices from government APIs
 */

const express = require('express');
const router = express.Router();
const {
  fetchCommodityPrice,
  fetchBulkPrices,
  getAvailableCommodities,
  SPICE_MAPPING
} = require('../utils/commodityPriceAPI');

/**
 * GET /api/live-prices/commodity/:name
 * Fetch real-time price for a specific spice
 * 
 * Example: GET /api/live-prices/commodity/Turmeric
 */
router.get('/commodity/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const apiKey = req.query.apiKey || process.env.DATA_GOV_API_KEY || process.env.DATA_GOV_IN_API_KEY || null;

    const priceData = await fetchCommodityPrice(name, apiKey);

    if (priceData.error) {
      return res.status(200).json({
        success: false,
        error: `Could not fetch price for ${name}`,
        data: priceData,
        sources: ['CEDA API', 'data.gov.in'],
        suggestion: 'Commodity may not be actively traded or API may be temporarily unavailable',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: priceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/live-prices/bulk?commodities=Turmeric,Chilli,Cumin
 * Fetch prices for multiple spices
 */
router.get('/bulk', async (req, res) => {
  try {
    const { commodities, apiKey } = req.query;
    const resolvedApiKey = apiKey || process.env.DATA_GOV_API_KEY || process.env.DATA_GOV_IN_API_KEY || null;

    if (!commodities) {
      return res.status(400).json({ 
        error: 'commodities parameter required',
        example: '/api/live-prices/bulk?commodities=Turmeric,Chilli,Cumin'
      });
    }

    const commodityList = commodities.split(',').map(c => c.trim());
    const prices = await fetchBulkPrices(commodityList, resolvedApiKey);
    const successCount = Object.values(prices).filter(price => !price.error).length;
    const failureCount = Object.values(prices).filter(price => price.error).length;

    res.json({
      success: true,
      count: commodityList.length,
      summary: {
        fetched: successCount,
        failed: failureCount
      },
      data: prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/live-prices/spices
 * Fetch prices for all 35 spices in inventory
 */
router.get('/spices', async (req, res) => {
  try {
    const apiKey = req.query.apiKey || process.env.DATA_GOV_API_KEY || process.env.DATA_GOV_IN_API_KEY || null;

    // All spices from the product catalog
    const spiceNames = Object.keys(SPICE_MAPPING);
    const prices = await fetchBulkPrices(spiceNames, apiKey);

    // Summary stats
    const successCount = Object.values(prices).filter(p => !p.error).length;
    const failureCount = spiceNames.length - successCount;

    res.json({
      success: true,
      summary: {
        total: spiceNames.length,
        pricesFetched: successCount,
        failedFetches: failureCount
      },
      data: prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/live-prices/available
 * List all available commodities from CEDA API
 */
router.get('/available', async (req, res) => {
  try {
    const commodities = await getAvailableCommodities();

    res.json({
      success: true,
      count: commodities.length,
      commodities: commodities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/live-prices/status
 * Check API health and connectivity
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      apis: {}
    };

    // Test CEDA API
    try {
      const cedaResponse = await Promise.race([
        fetch('https://api.ceda.ashoka.edu.in/api/v1/commodities'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      status.apis.ceda = {
        status: cedaResponse.ok ? 'operational' : 'degraded',
        responseCode: cedaResponse.status
      };
    } catch (e) {
      status.apis.ceda = {
        status: 'unreachable',
        error: e.message
      };
    }

    // Test data.gov.in
    try {
      const govResponse = await Promise.race([
        fetch('https://data.gov.in/api/datastore_search?resource_id=9ef84268-d588-465a-a5c0-3b405fcc2df8&limit=1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      status.apis.dataGov = {
        status: govResponse.ok ? 'operational' : 'degraded',
        responseCode: govResponse.status
      };
    } catch (e) {
      status.apis.dataGov = {
        status: 'unreachable',
        error: e.message
      };
    }

    const allOperational = Object.values(status.apis).every(api => api.status === 'operational');
    
    res.json({
      success: true,
      overallStatus: allOperational ? 'all_operational' : 'partial_availability',
      ...status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
