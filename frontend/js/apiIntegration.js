// ============ API CONFIGURATION ============
const API_URL = 'http://localhost:5000/api'; // Change to your deployed URL

// ============ SEND PRODUCT INQUIRY ============
async function sendProductInquiry(data) {
  try {
    const response = await fetch(`${API_URL}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Inquiry sent! Check your email and open WhatsApp.');
      if (result.whatsappLink) {
        window.open(result.whatsappLink, '_blank');
      }
    } else {
      alert('❌ Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to send inquiry');
  }
}

// ============ SEND QUOTE REQUEST ============
async function sendQuoteRequest(data) {
  try {
    const response = await fetch(`${API_URL}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Quote request sent! Check your email.');
    } else {
      alert('❌ Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to send quote request');
  }
}

// ============ SEND CONTACT MESSAGE ============
async function sendContactMessage(data) {
  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Message sent! We will get back to you soon.');
    } else {
      alert('❌ Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to send message');
  }
}

// ============ GET ADMIN DASHBOARD DATA ============
async function getDashboardData() {
  try {
    const response = await fetch(`${API_URL}/dashboard`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// ============ EXAMPLE USAGE IN HTML ============
/*

// Button in HTML:
<button onclick="openQuickBuy(productData)">Buy Now</button>

// Function to call:
function openQuickBuy(product) {
  const data = {
    name: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value,
    productName: product.name,
    quantity: document.getElementById('quantity').value,
    unit: 'kg',
    specialInstructions: document.getElementById('instructions').value
  };
  
  sendProductInquiry(data);
}

// For Quote Form:
function submitQuote(event) {
  event.preventDefault();
  
  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    company: document.getElementById('company').value,
    country: document.getElementById('country').value,
    productType: document.getElementById('productType').value,
    quantity: document.getElementById('quantity').value,
    details: document.getElementById('details').value
  };
  
  sendQuoteRequest(data);
}

*/
