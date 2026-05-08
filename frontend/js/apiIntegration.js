// ============================================================================
// TamilEelam Export House - Frontend API Integration
// ============================================================================
// This file handles all communication between the frontend and backend server
// Ensures seamless connection for product inquiries, quotes, and contacts

const API_BASE_URL = window.location.origin;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Log messages with timestamp for debugging
 */
function debugLog(message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`, data || '');
}

/**
 * Generate pre-filled WhatsApp message
 */
function generateWhatsAppMessage(productName, quantity, unit) {
  return `Hi, I'm interested in ${quantity} ${unit} of ${productName}. Please provide more details and pricing.`;
}

/**
 * Handle API errors with user-friendly messages
 */
function handleApiError(error, context) {
  console.error(`[API Error - ${context}]`, error);
  
  if (error.message === 'Failed to fetch') {
    return {
      success: false,
      message: '❌ Backend server is not running. Please start the backend first.',
      isConnectionError: true
    };
  }
  
  return {
    success: false,
    message: `❌ Error: ${error.message}`,
    isConnectionError: false
  };
}

// ============================================================================
// CONNECTION TESTING
// ============================================================================

/**
 * Test backend connection on page load
 * Provides visual feedback about backend status
 */
async function testBackendConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      debugLog('✅ Backend Connected Successfully');
      console.log('%c✅ Backend API is ONLINE and ready!', 'color: green; font-weight: bold; font-size: 14px;');
      return true;
    } else {
      debugLog('⚠️ Backend returned status:', response.status);
      console.log('%c⚠️ Backend server is running but returned an error', 'color: orange; font-weight: bold;');
      return false;
    }
  } catch (error) {
    debugLog('❌ Backend Connection Failed', error);
    console.log(`%c❌ Backend server is NOT running at ${API_BASE_URL}`, 'color: red; font-weight: bold; font-size: 14px;');
    console.log('Start the backend with: cd backend && npm start');
    return false;
  }
}

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

/**
 * Send product inquiry to backend
 * Called when customer clicks "Buy Now" and completes the form
 */
async function sendProductInquiry(data) {
  try {
    debugLog('Sending product inquiry...', data);
    
    const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        productName: data.productName,
        quantity: data.quantity,
        unit: data.unit,
        specialInstructions: data.specialInstructions || ''
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    debugLog('✅ Inquiry sent successfully', result);
    
    if (result.success) {
      showToast('✅ Order inquiry submitted! Check your email for confirmation.');
      
      // Generate WhatsApp link if available
      if (result.whatsappLink) {
        window.open(result.whatsappLink, '_blank');
      }
      
      return true;
    } else {
      showToast(`❌ ${result.message}`);
      return false;
    }
  } catch (error) {
    const errorInfo = handleApiError(error, 'sendProductInquiry');
    showToast(errorInfo.message);
    return false;
  }
}

/**
 * Send quote request to backend
 * Called when customer submits the bulk quote form
 */
async function sendQuoteRequest(data) {
  try {
    debugLog('Sending quote request...', data);
    
    const response = await fetch(`${API_BASE_URL}/api/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        company: data.company,
        country: data.country,
        productType: data.productType,
        quantity: data.quantity,
        details: data.details
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    debugLog('✅ Quote request sent successfully', result);
    
    if (result.success) {
      showToast('✅ Quote request received! Our team will contact you soon.');
      return true;
    } else {
      showToast(`❌ ${result.message}`);
      return false;
    }
  } catch (error) {
    const errorInfo = handleApiError(error, 'sendQuoteRequest');
    showToast(errorInfo.message);
    return false;
  }
}

/**
 * Send contact form message to backend
 * General contact inquiries
 */
async function sendContactMessage(data) {
  try {
    debugLog('Sending contact message...', data);
    
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    debugLog('✅ Contact message sent successfully', result);
    
    if (result.success) {
      showToast('✅ Thank you! We\'ll get back to you shortly.');
      return true;
    } else {
      showToast(`❌ ${result.message}`);
      return false;
    }
  } catch (error) {
    const errorInfo = handleApiError(error, 'sendContactMessage');
    showToast(errorInfo.message);
    return false;
  }
}

/**
 * Get all inquiries (Admin dashboard)
 * Retrieve list of all customer inquiries
 */
async function getInquiries() {
  try {
    debugLog('Fetching inquiries...');
    
    const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const inquiries = await response.json();
    debugLog('✅ Inquiries fetched', inquiries);
    return inquiries;
  } catch (error) {
    const errorInfo = handleApiError(error, 'getInquiries');
    console.error(errorInfo.message);
    return [];
  }
}

/**
 * Get admin dashboard statistics
 */
async function getDashboardStats() {
  try {
    debugLog('Fetching dashboard stats...');
    
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const stats = await response.json();
    debugLog('✅ Dashboard stats fetched', stats);
    return stats;
  } catch (error) {
    const errorInfo = handleApiError(error, 'getDashboardStats');
    console.error(errorInfo.message);
    return null;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize API module on page load
 * Test backend connection and log startup info
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('%c🌶️ TamilEelam Export House - Frontend Ready', 'color: #d9572f; font-weight: bold; font-size: 16px;');
  console.log(`API Endpoint: ${API_BASE_URL}`);
  
  // Test backend connection
  const isConnected = await testBackendConnection();
  
  if (isConnected) {
    console.log('%c✅ All systems operational!', 'color: green; font-weight: bold;');
  } else {
    console.log('%c⚠️ Backend connection failed - Using local fallback data', 'color: orange; font-weight: bold;');
  }
});

// ============================================================================
// EXPORT FUNCTIONS FOR USE IN HTML
// ============================================================================

// Make functions globally available for HTML onclick handlers
window.sendProductInquiry = sendProductInquiry;
window.sendQuoteRequest = sendQuoteRequest;
window.sendContactMessage = sendContactMessage;
window.getInquiries = getInquiries;
window.getDashboardStats = getDashboardStats;
window.generateWhatsAppMessage = generateWhatsAppMessage;
window.testBackendConnection = testBackendConnection;

// ============================================================================
// REAL-TIME DATA FUNCTIONS - Add these to apiIntegration.js
// ============================================================================

/**
 * Fetch products from backend API (real-time data)
 */
async function fetchProductsFromAPI() {
  try {
    debugLog('Fetching products from API...');
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    debugLog('✅ Products fetched successfully', data.length);
    return data;
  } catch (error) {
    debugLog('❌ Failed to fetch products from API', error);
    console.error('Products API Error:', error);
    return null;
  }
}

/**
 * Seed database with initial data (run once on first load)
 */
async function seedProductsDatabase() {
  try {
    debugLog('Seeding products database...');
    const response = await fetch(`${API_BASE_URL}/api/products/seed/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Seed failed: ${response.status}`);
    }

    const result = await response.json();
    debugLog('✅ Database seeded', result);
    return true;
  } catch (error) {
    debugLog('❌ Seed failed', error);
    return false;
  }
}

/**
 * Update product in real-time (price, stock, discount, etc.)
 */
async function updateProductInAPI(productId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }

    const updated = await response.json();
    debugLog('✅ Product updated in database', updated);
    return updated;
  } catch (error) {
    debugLog('❌ Product update failed', error);
    return null;
  }
}

/**
 * Example: Update price for a specific spice
 */
async function updateSpicePrice(spiceName, newPrice) {
  try {
    const product = products.find(p => p.name === spiceName);
    if (!product) {
      showToast(`❌ ${spiceName} not found`);
      return;
    }

    const updated = await updateProductInAPI(product.id, { price: newPrice });
    if (updated) {
      // Update local array
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products[index] = updated;
        renderProducts();
        showToast(`✅ ${spiceName} price updated to ${money(newPrice)}`);
      }
    }
  } catch (error) {
    console.error('Price update error:', error);
    showToast('❌ Failed to update price');
  }
}

/**
 * Example: Update stock for a specific spice
 */
async function updateSpiceStock(spiceName, newStock) {
  try {
    const product = products.find(p => p.name === spiceName);
    if (!product) {
      showToast(`❌ ${spiceName} not found`);
      return;
    }

    const availability = newStock <= 0 ? 'Out of Stock' : newStock < 20 ? 'Low Stock' : 'In Stock';
    const updated = await updateProductInAPI(product.id, { 
      stock: newStock,
      availability: availability
    });

    if (updated) {
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products[index] = updated;
        renderProducts();
        showToast(`📦 ${spiceName} stock updated to ${newStock} kg`);
      }
    }
  } catch (error) {
    console.error('Stock update error:', error);
    showToast('❌ Failed to update stock');
  }
}

/**
 * Example: Add discount to a product
 */
async function addDiscount(spiceName, discountPercent) {
  try {
    const product = products.find(p => p.name === spiceName);
    if (!product) {
      showToast(`❌ ${spiceName} not found`);
      return;
    }

    const updated = await updateProductInAPI(product.id, { 
      discount: discountPercent,
      badge: discountPercent > 10 ? 'sale' : product.badge
    });

    if (updated) {
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products[index] = updated;
        renderProducts();
        showToast(`🏷️ ${discountPercent}% discount added to ${spiceName}!`);
      }
    }
  } catch (error) {
    console.error('Discount error:', error);
    showToast('❌ Failed to add discount');
  }
}

/**
 * Example: Update product rating based on reviews
 */
async function updateProductRating(spiceName, newRating, newReviewCount) {
  try {
    const product = products.find(p => p.name === spiceName);
    if (!product) {
      showToast(`❌ ${spiceName} not found`);
      return;
    }

    const updated = await updateProductInAPI(product.id, { 
      rating: newRating,
      reviews: newReviewCount
    });

    if (updated) {
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products[index] = updated;
        renderProducts();
        showToast(`⭐ ${spiceName} rating updated to ${newRating}`);
      }
    }
  } catch (error) {
    console.error('Rating update error:', error);
    showToast('❌ Failed to update rating');
  }
}

/**
 * Load products from API or use fallback
 */
async function initializeProducts() {
  try {
    // Test backend connection first
    const connected = await testBackendConnection();
    
    if (connected) {
      // Try to seed database (safe - won't duplicate if already exists)
      await seedProductsDatabase();
      
      // Load products from API
      const apiProducts = await fetchProductsFromAPI();
      if (apiProducts && apiProducts.length > 0) {
        products = apiProducts;
        console.log(`✅ Loaded ${products.length} products from database`);
        return true;
      }
    }
    
    console.warn('⚠️ Could not load from API, products not initialized');
    return false;
  } catch (error) {
    console.error('Product initialization error:', error);
    return false;
  }
}
