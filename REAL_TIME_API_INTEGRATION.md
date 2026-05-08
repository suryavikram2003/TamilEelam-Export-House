# Real-Time Commodity Price API Integration Guide

## Overview

Your backend now integrates with government commodity price APIs to provide real-time spice prices. This guide explains the new endpoints and how to use them.

## API Sources

### 1. **CEDA API** (Primary)

- **URL**: https://api.ceda.ashoka.edu.in
- **Provider**: Ashoka University CEDA Lab
- **Data Source**: Aggregates from Agmarknet (Ministry of Agriculture)
- **Coverage**: 300+ commodities including all major spices
- **Cost**: Free (non-commercial use)
- **Update Frequency**: Daily
- **Documentation**: Has Swagger UI for exploration

### 2. **data.gov.in** (Fallback)

- **URL**: https://data.gov.in
- **Provider**: Ministry of Electronics & IT (Government of India)
- **Official Source**: Raw government data
- **Coverage**: All APMC (Agricultural Produce Market Committee) data
- **Cost**: Free with API key registration
- **API Key**: `2556fe3ca83dcad0d05429c58e244f0368c63af9faa1186cfd6568983693be09`

## New Backend Endpoints

All endpoints return JSON responses with real-time prices from government APIs.

### 1. Get Price for Single Commodity

**Endpoint**: `GET /api/live-prices/commodity/:name`

**Parameters**:

- `name` (path): Spice name (e.g., "Turmeric", "Black Pepper", "Chilli")
- `apiKey` (query, optional): For data.gov.in fallback

**Example Request**:

```bash
curl "http://localhost:5000/api/live-prices/commodity/Turmeric"
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "source": "CEDA",
    "commodity": "Turmeric",
    "modalPrice": 6500,
    "minPrice": 6200,
    "maxPrice": 6800,
    "unit": "kg",
    "date": "2024-05-08",
    "market": "Erode",
    "rawData": { ... }
  },
  "timestamp": "2024-05-08T10:30:00Z"
}
```

### 2. Bulk Fetch - Get Prices for Multiple Spices

**Endpoint**: `GET /api/live-prices/bulk?commodities=Turmeric,Chilli,Cumin`

**Parameters**:

- `commodities` (query, required): Comma-separated spice names
- `apiKey` (query, optional): For data.gov.in fallback

**Example Request**:

```bash
curl "http://localhost:5000/api/live-prices/bulk?commodities=Turmeric,Chilli,Cumin,Black%20Pepper"
```

**Example Response**:

```json
{
  "success": true,
  "count": 4,
  "data": {
    "Turmeric": { "source": "CEDA", "modalPrice": 6500, ... },
    "Chilli": { "source": "CEDA", "modalPrice": 3200, ... },
    "Cumin": { "source": "CEDA", "modalPrice": 8500, ... },
    "Black Pepper": { "source": "CEDA", "modalPrice": 7200, ... }
  },
  "timestamp": "2024-05-08T10:30:00Z"
}
```

### 3. All 35 Spices - Get Prices for Your Entire Inventory

**Endpoint**: `GET /api/live-prices/spices`

**Example Request**:

```bash
curl "http://localhost:5000/api/live-prices/spices"
```

**Example Response**:

```json
{
  "success": true,
  "summary": {
    "total": 35,
    "pricesFetched": 28,
    "failedFetches": 7
  },
  "data": {
    "Black Pepper": { "source": "CEDA", "modalPrice": 7200, ... },
    "Turmeric (Whole)": { "source": "CEDA", "modalPrice": 6500, ... },
    "Red Chilli (Whole)": { "source": "CEDA", "modalPrice": 3200, ... },
    ...
  },
  "timestamp": "2024-05-08T10:30:00Z"
}
```

### 4. Check API Status

**Endpoint**: `GET /api/live-prices/status`

**Example Request**:

```bash
curl "http://localhost:5000/api/live-prices/status"
```

**Example Response**:

```json
{
  "success": true,
  "overallStatus": "all_operational",
  "timestamp": "2024-05-08T10:30:00Z",
  "apis": {
    "ceda": {
      "status": "operational",
      "responseCode": 200
    },
    "dataGov": {
      "status": "operational",
      "responseCode": 200
    }
  }
}
```

### 5. List Available Commodities

**Endpoint**: `GET /api/live-prices/available`

**Example Request**:

```bash
curl "http://localhost:5000/api/live-prices/available"
```

**Example Response**:

```json
{
  "success": true,
  "count": 300,
  "commodities": [
    { "name": "Black Pepper", "code": "BP" },
    { "name": "Turmeric", "code": "TM" },
    ...
  ],
  "timestamp": "2024-05-08T10:30:00Z"
}
```

## Response Data Fields

Each price record contains:

```json
{
  "source": "CEDA",           // Which API provided the data
  "commodity": "Turmeric",    // Commodity name
  "modalPrice": 6500,         // Most common price (per kg)
  "minPrice": 6200,           // Minimum price that day
  "maxPrice": 6800,           // Maximum price that day
  "unit": "kg",               // Price unit
  "date": "2024-05-08",       // Date of price data
  "market": "Erode",          // Market/Mandi name
  "variety": "Erode Turmeric",// Specific variety (if available)
  "state": "Tamil Nadu",      // State (if available)
  "rawData": { ... }          // Full raw API response
}
```

## Spice Name Mapping

The system automatically maps your product names to government commodity codes:

| Your Product Name  | Government Commodity |
| ------------------ | -------------------- |
| Black Pepper       | Black Pepper         |
| Turmeric (Whole)   | Turmeric             |
| Red Chilli (Whole) | Chilli               |
| Cumin Seeds        | Cumin                |
| Coriander Seeds    | Coriander            |
| Cardamom (Green)   | Cardamom             |
| Garlic (Dry)       | Garlic               |
| Ginger (Dry)       | Ginger               |
| ...                | ...                  |

See `backend/utils/commodityPriceAPI.js` for complete mapping.

## Implementation Examples

### JavaScript/Frontend Example

```javascript
// Fetch single spice price
async function getSpicePrice(spiceName) {
  try {
    const response = await fetch(
      `/api/live-prices/commodity/${encodeURIComponent(spiceName)}`,
    );
    const result = await response.json();

    if (result.success) {
      console.log(
        `${spiceName}: ₹${result.data.modalPrice}/${result.data.unit}`,
      );
      return result.data;
    }
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

// Fetch multiple spices
async function getBulkPrices() {
  const spices = ["Turmeric", "Black Pepper", "Chilli", "Cumin"];
  try {
    const response = await fetch(
      `/api/live-prices/bulk?commodities=${spices.join(",")}`,
    );
    const result = await response.json();

    if (result.success) {
      Object.entries(result.data).forEach(([name, price]) => {
        console.log(`${name}: ₹${price.modalPrice}/${price.unit}`);
      });
    }
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

// Update all product prices in inventory
async function updateAllPrices() {
  try {
    const response = await fetch("/api/live-prices/spices");
    const result = await response.json();

    console.log(`Updated ${result.summary.pricesFetched} prices`);
    console.log(`Failed fetches: ${result.summary.failedFetches}`);

    return result.data;
  } catch (error) {
    console.error("Error updating prices:", error);
  }
}
```

### Node.js/Backend Example

```javascript
const axios = require("axios");

async function updateProductPrices() {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/live-prices/spices",
    );

    const priceData = response.data.data;

    // Update database with new prices
    for (const [spiceName, priceInfo] of Object.entries(priceData)) {
      if (!priceInfo.error) {
        await Product.updateOne(
          { name: spiceName },
          {
            apiPrice: priceInfo.modalPrice,
            marketPrice: priceInfo.modalPrice,
            priceSource: priceInfo.source,
            lastPriceUpdate: new Date(),
            marketDetails: {
              market: priceInfo.market,
              minPrice: priceInfo.minPrice,
              maxPrice: priceInfo.maxPrice,
            },
          },
        );
      }
    }

    console.log("Prices updated successfully");
  } catch (error) {
    console.error("Error updating prices:", error);
  }
}
```

## Setting Up Scheduled Price Updates

Add this to your `backend/server.js` to automatically fetch prices every 6 hours:

```javascript
const cron = require("node-cron");
const axios = require("axios");

// Run every 6 hours: at 00:00, 06:00, 12:00, 18:00
cron.schedule("0 */6 * * *", async () => {
  console.log("🔄 Fetching real-time commodity prices...");

  try {
    const response = await axios.get(
      "http://localhost:5000/api/live-prices/spices",
    );
    const priceData = response.data.data;

    // Update your database here
    console.log(
      `✅ Updated prices from ${response.data.summary.pricesFetched} commodities`,
    );
  } catch (error) {
    console.error("❌ Price update failed:", error.message);
  }
});
```

Install `node-cron`:

```bash
npm install node-cron
```

## Error Handling

Responses include helpful error messages:

```json
{
  "error": "Could not fetch price for UnknownSpice",
  "sources": ["CEDA API", "data.gov.in"],
  "suggestion": "Commodity may not be actively traded or API may be temporarily unavailable"
}
```

**Common Issues**:

1. **Commodity not found**: The spice is not traded in standard mandis (e.g., Vanilla, Saffron)
2. **API timeout**: Government APIs may be slow during peak hours
3. **Network error**: Check internet connectivity

## Data Freshness

- **CEDA API**: Updated daily (around 8 AM IST)
- **data.gov.in**: Updated as mandis report data
- Typical delay: 24-48 hours from actual market transaction

## Rate Limits

- **CEDA API**: No documented rate limit (assumed free tier)
- **data.gov.in**: Recommended max 100 requests/hour per API key
- Your backend queues requests, so frontend can call freely

## Coverage for Your Spices

| Spice                             | Status         | API Source       |
| --------------------------------- | -------------- | ---------------- |
| **Readily Available** (28 spices) | ✅ Live prices | CEDA/DataGov     |
| **Premium/Specialty** (7 spices)  | ⚠️ Partial     | Limited mandis   |
| Cardamom, Saffron, Vanilla        | 🔴 Limited     | Auction-based    |
| Kokum, Dried Rose Petals          | 🔴 Limited     | Regional markets |

**Solution for Specialty Items**: Manually curate prices for high-value spices or build a scraper for Spices Board data.

## File Structure

```
backend/
├── utils/
│   └── commodityPriceAPI.js        # API integration logic
├── routes/
│   ├── products.js                 # (Updated) Product routes
│   └── livePrices.js              # (New) Real-time price endpoints
└── server.js                       # (Updated) Route registration
```

## Testing

```bash
# Test single commodity
curl "http://localhost:5000/api/live-prices/commodity/Turmeric"

# Test multiple commodities
curl "http://localhost:5000/api/live-prices/bulk?commodities=Turmeric,Chilli"

# Test all inventory prices
curl "http://localhost:5000/api/live-prices/spices"

# Check API status
curl "http://localhost:5000/api/live-prices/status"

# Get available commodities list
curl "http://localhost:5000/api/live-prices/available"
```

## Next Steps

1. **Start your backend**: `npm start` in the `backend/` directory
2. **Test endpoints**: Use the curl commands above
3. **Integrate into frontend**: Call the endpoints from your React/Vue/vanilla JS
4. **Set up cron jobs**: Auto-update prices every 6-12 hours
5. **Handle specialty items**: Manually manage cardamom, saffron, and vanilla prices

## Support Resources

- **CEDA API Docs**: https://api.ceda.ashoka.edu.in (has Swagger UI)
- **data.gov.in**: https://data.gov.in
- **Agmarknet**: https://agmarknet.gov.in (raw source)

## Troubleshooting

**Q: Why are some prices returning errors?**
A: Not all spices are traded in standard agricultural mandis. Premium/specialty items need manual curation.

**Q: Can I combine CEDA and data.gov prices?**
A: Yes! Use the `apiKey` query parameter to try data.gov if CEDA fails.

**Q: How do I update frontend prices in real-time?**
A: Use WebSockets or set up a scheduled client-side fetch every 6 hours.

**Q: What's the accuracy of prices?**
A: Based on government mandi reports with 24-48 hour delays. Use for reference only.
