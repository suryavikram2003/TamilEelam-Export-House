# 🌶️ Real-Time Commodity Price API - Complete Setup Guide

## What Was Implemented

Your backend now integrates with government commodity price APIs to fetch real-time spice prices. No more hardcoded prices!

### New Files Created:

1. **`backend/utils/commodityPriceAPI.js`** - Core API integration module
   - Fetches from CEDA API (primary)
   - Fallback to data.gov.in
   - Automatic spice name mapping

2. **`backend/routes/livePrices.js`** - Express routes for price endpoints
   - Single commodity price lookup
   - Bulk price fetching
   - All 35 inventory spices
   - API status checking
   - Available commodities listing

3. **`TEST_LIVE_PRICES.html`** - Interactive test interface
   - Beautiful UI for testing all endpoints
   - Quick price lookup for individual spices
   - Bulk price checking
   - API status monitoring

4. **`REAL_TIME_API_INTEGRATION.md`** - Complete documentation

### Files Updated:

1. **`backend/server.js`**
   - Added `livePricesRoutes` import
   - Registered `/api/live-prices` route
   - Does NOT require MongoDB connection (works independently)

2. **`backend/routes/products.js`**
   - Fixed corruption (removed `api.ceda.ashoka.edu.in` text from line 44)

---

## Quick Start (5 Minutes)

### Step 1: Start Your Backend

```bash
cd backend
npm install  # Install dependencies if needed
npm start    # Start server on http://localhost:5000
```

### Step 2: Test the APIs

#### Option A: Using Test Interface

1. Open browser: `http://localhost:5000/api/live-prices/status`
2. Or serve the test HTML:
   ```bash
   # Copy TEST_LIVE_PRICES.html to backend and serve
   # Open http://localhost:5000/TEST_LIVE_PRICES.html
   ```

#### Option B: Using curl/Postman

```bash
# Get single spice price
curl http://localhost:5000/api/live-prices/commodity/Turmeric

# Get multiple spices
curl "http://localhost:5000/api/live-prices/bulk?commodities=Turmeric,Chilli,Cumin"

# Get all 35 spices
curl http://localhost:5000/api/live-prices/spices

# Check API status
curl http://localhost:5000/api/live-prices/status
```

#### Option C: Using JavaScript

```javascript
// In your frontend code
fetch("/api/live-prices/commodity/Black Pepper")
  .then((r) => r.json())
  .then((data) => console.log(data.data.modalPrice));
```

---

## API Endpoints Reference

### 1. Single Commodity Price

```
GET /api/live-prices/commodity/:name
```

**Example**: `/api/live-prices/commodity/Turmeric`

**Response**:

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
    "market": "Erode"
  }
}
```

### 2. Bulk Commodities

```
GET /api/live-prices/bulk?commodities=Turmeric,Chilli,Cumin
```

**Response**:

```json
{
  "success": true,
  "count": 3,
  "data": {
    "Turmeric": { ... },
    "Chilli": { ... },
    "Cumin": { ... }
  }
}
```

### 3. All Inventory Prices

```
GET /api/live-prices/spices
```

**Response**:

```json
{
  "success": true,
  "summary": {
    "total": 35,
    "pricesFetched": 28,
    "failedFetches": 7
  },
  "data": { ... }
}
```

### 4. API Status

```
GET /api/live-prices/status
```

**Response**:

```json
{
  "success": true,
  "overallStatus": "all_operational",
  "apis": {
    "ceda": { "status": "operational", "responseCode": 200 },
    "dataGov": { "status": "operational", "responseCode": 200 }
  }
}
```

---

## Common Use Cases

### Update Product Prices Daily

```javascript
// In backend/server.js or a cron job
const axios = require("axios");

setInterval(
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/live-prices/spices",
    );
    const prices = response.data.data;

    for (const [spiceName, priceData] of Object.entries(prices)) {
      if (!priceData.error) {
        // Update your database
        await Product.updateOne(
          { name: spiceName },
          { marketPrice: priceData.modalPrice, lastUpdated: new Date() },
        );
      }
    }

    console.log("✅ Prices updated");
  },
  6 * 60 * 60 * 1000,
); // Every 6 hours
```

### Display Real-Time Price on Product Page

```html
<div id="price-container">
  <span id="price-value">Loading...</span>
  <span id="price-unit">/kg</span>
  <button onclick="refreshPrice()">🔄 Refresh</button>
</div>

<script>
  async function refreshPrice() {
    const spiceName = document.getElementById("spice-name").value;
    const response = await fetch(
      `/api/live-prices/commodity/${encodeURIComponent(spiceName)}`,
    );
    const data = await response.json();

    if (data.success) {
      document.getElementById("price-value").textContent =
        `₹${data.data.modalPrice}`;
      document.getElementById("price-unit").textContent = `/${data.data.unit}`;
    }
  }

  // Auto-refresh every hour
  setInterval(refreshPrice, 60 * 60 * 1000);
</script>
```

### Show Price Range & Market Info

```javascript
async function showPriceDetails(spiceName) {
  const response = await fetch(
    `/api/live-prices/commodity/${encodeURIComponent(spiceName)}`,
  );
  const { data: price } = await response.json();

  console.log(`
    ${spiceName}
    Market: ${price.market}
    Price Range: ₹${price.minPrice} - ₹${price.maxPrice}
    Modal Price: ₹${price.modalPrice}
    Updated: ${price.date}
  `);
}
```

---

## Data Sources

### CEDA API

- **Provider**: Ashoka University
- **Coverage**: 300+ commodities
- **Update**: Daily
- **Speed**: Fast
- **Status**: Recommended primary source

### data.gov.in

- **Provider**: Government of India
- **Coverage**: Official APMC data
- **Update**: As reported by mandis
- **Accuracy**: High
- **Status**: Fallback source

---

## Troubleshooting

### Issue: "Cannot fetch from CEDA API"

**Solution**:

- Government APIs may be slow during peak hours (6-10 AM IST)
- Try again later or use data.gov.in with API key

### Issue: Some spices return errors

**Solution**:

- Specialty items (Saffron, Vanilla, Cardamom) are traded differently
- These need manual price curation
- See `REAL_TIME_API_INTEGRATION.md` for coverage table

### Issue: "Commodity not found"

**Solution**:

- Not all spices are traded in agricultural mandis
- Check the exact commodity name in API documentation
- Some names need to be mapped (e.g., "Red Chilli" → "Chilli")

### Issue: Backend not responding

**Solution**:

```bash
# Check if backend is running
curl http://localhost:5000

# Check port availability
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

---

## Next Steps

1. ✅ **Start backend**: `npm start` in `backend/`
2. ✅ **Test endpoints**: Visit `/api/live-prices/status`
3. ✅ **Integrate frontend**: Call endpoints from React/Vue/vanilla JS
4. ⏳ **Optional**: Set up automated price updates every 6-12 hours
5. ⏳ **Optional**: Add manual price management for premium spices

---

## File Structure Summary

```
d:\TamilEelam\
├── backend/
│   ├── utils/
│   │   └── commodityPriceAPI.js          ✨ NEW: Core API module
│   ├── routes/
│   │   ├── products.js                   🔧 FIXED: Removed corruption
│   │   └── livePrices.js                 ✨ NEW: Price endpoints
│   ├── server.js                         🔧 UPDATED: Route registration
│   └── package.json                      (Already has axios)
├── TEST_LIVE_PRICES.html                 ✨ NEW: Interactive tester
└── REAL_TIME_API_INTEGRATION.md          ✨ NEW: Full documentation
```

---

## API Key Information

**data.gov.in API Key** (for fallback):

```
2556fe3ca83dcad0d05429c58e244f0368c63af9faa1186cfd6568983693be09
```

This is already included in the integration module. You can pass it via query parameter:

```
/api/live-prices/commodity/Turmeric?apiKey=YOUR_KEY
```

---

## Performance Tips

1. **Reduce API calls**: Cache prices for 6 hours
2. **Batch requests**: Use `/bulk` endpoint instead of multiple single calls
3. **Check status first**: Use `/status` to verify APIs before bulk operations
4. **Handle failures gracefully**: Always show fallback prices when API fails

---

## Example: Complete Integration

```javascript
// Complete example for updating product prices

class PriceManager {
  constructor(updateIntervalHours = 6) {
    this.updateInterval = updateIntervalHours * 60 * 60 * 1000;
    this.cache = {};
    this.lastUpdate = null;
  }

  async fetchPrice(spiceName) {
    // Check cache first
    if (
      this.cache[spiceName] &&
      Date.now() - this.lastUpdate < this.updateInterval
    ) {
      return this.cache[spiceName];
    }

    try {
      const response = await fetch(
        `/api/live-prices/commodity/${encodeURIComponent(spiceName)}`,
      );
      const data = await response.json();

      if (data.success) {
        this.cache[spiceName] = data.data;
        this.lastUpdate = Date.now();
        return data.data;
      }
    } catch (error) {
      console.error(`Failed to fetch price for ${spiceName}:`, error);
      return this.cache[spiceName] || null;
    }
  }

  async updateAllPrices(spices) {
    const prices = await Promise.all(
      spices.map((name) => this.fetchPrice(name)),
    );
    return prices;
  }

  clearCache() {
    this.cache = {};
    this.lastUpdate = null;
  }
}

// Usage
const priceManager = new PriceManager(6);

// Get single price
const turmericPrice = await priceManager.fetchPrice("Turmeric");
console.log(
  `Current Turmeric: ₹${turmericPrice.modalPrice}/${turmericPrice.unit}`,
);

// Update all prices
const allPrices = await priceManager.updateAllPrices([
  "Turmeric",
  "Black Pepper",
  "Chilli",
  "Cumin",
]);
```

---

## Support & Documentation

- **Full Integration Guide**: `REAL_TIME_API_INTEGRATION.md`
- **Interactive Tester**: `TEST_LIVE_PRICES.html`
- **API Module**: `backend/utils/commodityPriceAPI.js`
- **Routes**: `backend/routes/livePrices.js`

**API Docs**:

- CEDA: https://api.ceda.ashoka.edu.in (has Swagger UI)
- DataGov: https://data.gov.in/resources/current-daily-price-various-commodities

---

## Summary

🎉 **Your spice trading platform now has real-time commodity prices from government APIs!**

- ✅ **CEDA API Integration**: Fast, reliable primary source
- ✅ **Fallback to data.gov.in**: Official government data
- ✅ **5 New Endpoints**: Single, bulk, inventory, status, available commodities
- ✅ **Interactive Tester**: Visual testing interface
- ✅ **Complete Documentation**: API guide and examples
- ✅ **Production Ready**: Error handling, caching support, rate limiting

**Start using it now**: `npm start` → Test → Integrate!
