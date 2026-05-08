#!/usr/bin/env node

/**
 * Quick Test Script for Real-Time Commodity Price APIs
 * Run with: node quick-test.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/live-prices';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function divider() {
  console.log('─'.repeat(70));
}

async function runTests() {
  log('\n🌶️  REAL-TIME COMMODITY PRICE API - TEST SUITE\n', 'cyan');

  // Test 1: Check if server is running
  log('Test 1: Server Connection', 'blue');
  divider();
  try {
    const response = await axios.get(`${API_BASE}/status`, { timeout: 5000 });
    log('✅ Backend server is running!', 'green');
  } catch (error) {
    log('❌ Cannot connect to backend!', 'red');
    log('   Make sure to run: cd backend && npm start', 'yellow');
    log(`   Error: ${error.message}`, 'red');
    return;
  }

  // Test 2: Check API Status
  log('\nTest 2: API Health Status', 'blue');
  divider();
  try {
    const response = await axios.get(`${API_BASE}/status`, { timeout: 5000 });
    const status = response.data;
    
    log(`Overall Status: ${status.overallStatus}`, 'cyan');
    
    Object.entries(status.apis).forEach(([name, api]) => {
      const color = api.status === 'operational' ? 'green' : 'yellow';
      log(`  ${name}: ${api.status}`, color);
    });
    
    log('✅ API Status check passed!', 'green');
  } catch (error) {
    log(`❌ Failed to check API status: ${error.message}`, 'red');
  }

  // Test 3: Single Commodity
  log('\nTest 3: Single Commodity Price (Turmeric)', 'blue');
  divider();
  try {
    const response = await axios.get(`${API_BASE}/commodity/Turmeric`, { timeout: 10000 });
    const data = response.data;
    
    if (data.success) {
      const price = data.data;
      log(`✅ Successfully fetched Turmeric price`, 'green');
      log(`   Source: ${price.source}`, 'cyan');
      log(`   Modal Price: ₹${price.modalPrice}/${price.unit}`, 'cyan');
      log(`   Range: ₹${price.minPrice} - ₹${price.maxPrice}`, 'cyan');
      log(`   Market: ${price.market}`, 'cyan');
      log(`   Date: ${price.date}`, 'cyan');
    } else {
      log(`⚠️  Response indicates failure: ${data.error}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Failed to fetch single commodity: ${error.message}`, 'red');
  }

  // Test 4: Bulk Commodities
  log('\nTest 4: Bulk Commodities Price (5 spices)', 'blue');
  divider();
  try {
    const spices = ['Turmeric', 'Black Pepper', 'Chilli', 'Cumin', 'Cardamom'];
    const response = await axios.get(`${API_BASE}/bulk?commodities=${spices.join(',')}`, { timeout: 15000 });
    const data = response.data;
    
    if (data.success) {
      log(`✅ Fetched prices for ${data.count} commodities`, 'green');
      
      let successCount = 0;
      Object.entries(data.data).forEach(([name, price]) => {
        if (!price.error) {
          log(`   ${name.padEnd(20)}: ₹${price.modalPrice}/${price.unit} (${price.source})`, 'cyan');
          successCount++;
        } else {
          log(`   ${name.padEnd(20)}: ERROR - ${price.error}`, 'yellow');
        }
      });
      
      log(`   Success Rate: ${successCount}/${data.count}`, 'cyan');
    } else {
      log(`⚠️  Response indicates failure: ${data.error}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Failed to fetch bulk commodities: ${error.message}`, 'red');
  }

  // Test 5: All 35 Spices
  log('\nTest 5: All 35 Inventory Spices', 'blue');
  divider();
  try {
    const response = await axios.get(`${API_BASE}/spices`, { timeout: 30000 });
    const data = response.data;
    
    if (data.success) {
      log(`✅ Inventory Price Summary:`, 'green');
      log(`   Total Spices: ${data.summary.total}`, 'cyan');
      log(`   Prices Fetched: ${data.summary.pricesFetched}`, 'green');
      log(`   Failed Fetches: ${data.summary.failedFetches}`, data.summary.failedFetches === 0 ? 'green' : 'yellow');
      
      const successRate = Math.round((data.summary.pricesFetched / data.summary.total) * 100);
      const rateColor = successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red';
      log(`   Success Rate: ${successRate}%`, rateColor);
      
      // Show first 10 prices
      log('\n   Sample Prices:', 'cyan');
      let shown = 0;
      Object.entries(data.data).forEach(([name, price]) => {
        if (!price.error && shown < 10) {
          log(`     ${name.padEnd(25)}: ₹${price.modalPrice.toString().padStart(5)}/${price.unit}`, 'cyan');
          shown++;
        }
      });
    } else {
      log(`⚠️  Response indicates failure: ${data.error}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Failed to fetch all inventory prices: ${error.message}`, 'red');
  }

  // Test 6: List Available Commodities
  log('\nTest 6: Available Commodities List', 'blue');
  divider();
  try {
    const response = await axios.get(`${API_BASE}/available`, { timeout: 10000 });
    const data = response.data;
    
    if (data.success) {
      log(`✅ Found ${data.count} available commodities`, 'green');
      if (Array.isArray(data.commodities) && data.commodities.length > 0) {
        log('   Sample commodities:', 'cyan');
        data.commodities.slice(0, 5).forEach(commodity => {
          const display = typeof commodity === 'string' ? commodity : commodity.name || JSON.stringify(commodity);
          log(`     - ${display}`, 'cyan');
        });
      }
    } else {
      log(`⚠️  Response indicates failure: ${data.error}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Failed to list available commodities: ${error.message}`, 'red');
  }

  // Summary
  divider();
  log('\n✅ TEST SUITE COMPLETED!\n', 'green');
  log('API Endpoints Available:', 'cyan');
  log('  GET  /api/live-prices/commodity/:name      - Get price for single spice', 'cyan');
  log('  GET  /api/live-prices/bulk?commodities=... - Get prices for multiple spices', 'cyan');
  log('  GET  /api/live-prices/spices               - Get prices for all 35 spices', 'cyan');
  log('  GET  /api/live-prices/status               - Check API health', 'cyan');
  log('  GET  /api/live-prices/available            - List available commodities', 'cyan');
  log('\nDocumentation:', 'cyan');
  log('  📖  SETUP_GUIDE_LIVE_PRICES.md', 'yellow');
  log('  📖  REAL_TIME_API_INTEGRATION.md', 'yellow');
  log('  🧪 TEST_LIVE_PRICES.html (open in browser)\n', 'yellow');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
