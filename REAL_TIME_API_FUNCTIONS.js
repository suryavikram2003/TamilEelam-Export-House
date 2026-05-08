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
