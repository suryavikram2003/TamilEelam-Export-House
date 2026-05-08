const axios = require('axios');

// Test CEDA API
async function testCedaAPI() {
  console.log('\n========== TESTING CEDA API ==========\n');
  
  const endpoints = [
    'https://api.ceda.ashoka.edu.in/api/v1/commodities',
    'https://api.ceda.ashoka.edu.in/api/commodities',
    'https://ashoka.edu.in/api/v1/commodities',
    'https://api.ceda.ashoka.edu.in/v1/prices?commodity=Turmeric',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTrying: ${endpoint}`);
      const response = await axios.get(endpoint, { 
        timeout: 5000,
        headers: { 'User-Agent': 'Node.js Test' }
      });
      console.log('✓ SUCCESS');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data).substring(0, 500));
      return response.data;
    } catch (error) {
      console.log('✗ Failed:', error.message);
    }
  }
}

// Test data.gov.in API
async function testDataGovAPI() {
  console.log('\n========== TESTING DATA.GOV.IN API ==========\n');
  
  const apiKey = '2556fe3ca83dcad0d05429c58e244f0368c63af9faa1186cfd6568983693be09';
  const endpoints = [
    `https://data.gov.in/api/datastore_search?resource_id=9ef84268-d588-465a-a5c0-3b405fcc2df8&api-key=${apiKey}`,
    `https://data.gov.in/api/datastore_search?resource_id=9ef84268-d588-465a-a5c0-3b405fcc2df8`,
    'https://data.gov.in/api/resources?format=json',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTrying: ${endpoint.substring(0, 80)}...`);
      const response = await axios.get(endpoint, { timeout: 5000 });
      console.log('✓ SUCCESS');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data).substring(0, 500));
      return response.data;
    } catch (error) {
      console.log('✗ Failed:', error.message);
    }
  }
}

// Run tests
(async () => {
  await testCedaAPI();
  await testDataGovAPI();
})();
