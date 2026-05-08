# 🧪 Testing Real-Time Data API

## Quick Test Commands

### **1. Test Backend Connection**

```bash
curl http://localhost:5000/health
```

Expected: ✅ Backend running

---

### **2. Seed Database with 35 Spices**

```bash
curl -X POST http://localhost:5000/api/products/seed/initialize \
  -H "Content-Type: application/json"
```

Response:

```json
{
  "message": "Successfully seeded 35 spices",
  "count": 35
}
```

---

### **3. Fetch All Products (Real-Time Data)**

```bash
curl http://localhost:5000/api/products
```

Response: Array of all 35 spices with current prices, stock, etc.

---

### **4. Get Single Product**

```bash
curl http://localhost:5000/api/products/1
```

Response:

```json
{
  "id": 1,
  "name": "Black Pepper",
  "origin": "Western Ghats",
  "price": 650,
  "stock": 100,
  "rating": 4.8,
  "reviews": 142,
  "lastUpdated": "2024-05-08T..."
}
```

---

### **5. Update Product Price**

```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 700}'
```

Response: Updated product with new price

---

### **6. Update Product Stock**

```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"stock": 50, "availability": "Low Stock"}'
```

---

### **7. Add Discount**

```bash
curl -X PUT http://localhost:5000/api/products/3 \
  -H "Content-Type: application/json" \
  -d '{"discount": 20, "badge": "sale"}'
```

---

### **8. Update Rating**

```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"rating": 4.9, "reviews": 200}'
```

---

## 🌐 Frontend Console Testing

Open browser DevTools (F12) → Console and run:

### **Test: Load Products from API**

```javascript
const products = await fetchProductsFromAPI();
console.log("Loaded products:", products.length);
```

Expected: `Loaded products: 35`

---

### **Test: Update Single Price**

```javascript
await updateSpicePrice("Black Pepper", 800);
// Should show toast: "✅ Black Pepper price updated to ₹800"
// Product card should update instantly
```

---

### **Test: Update Stock**

```javascript
await updateSpiceStock("Saffron", 5);
// Stock badge should change to "Low Stock"
```

---

### **Test: Add Discount**

```javascript
await addDiscount("Red Chilli (Whole)", 25);
// Should show "25% OFF" badge
// Price should update to reflect discount
```

---

### **Test: Update Rating**

```javascript
await updateProductRating("White Pepper", 4.95, 150);
// Rating should update to 4.95 ⭐
```

---

## 🔍 Admin Dashboard Example

Create a simple admin panel in HTML:

```html
<div
  style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;"
>
  <h3>🔧 Admin Panel - Real-Time Updates</h3>

  <div style="margin: 10px 0;">
    <label>Select Spice:</label>
    <select id="spiceSelect">
      <option value="">-- Select --</option>
      <option value="Black Pepper">Black Pepper</option>
      <option value="White Pepper">White Pepper</option>
      <option value="Saffron">Saffron</option>
    </select>
  </div>

  <div style="margin: 10px 0;">
    <label>New Price (INR):</label>
    <input type="number" id="priceInput" placeholder="Enter price" />
    <button onclick="updateAdmin('price')">Update Price</button>
  </div>

  <div style="margin: 10px 0;">
    <label>New Stock (kg):</label>
    <input type="number" id="stockInput" placeholder="Enter stock" />
    <button onclick="updateAdmin('stock')">Update Stock</button>
  </div>

  <div style="margin: 10px 0;">
    <label>Discount (%):</label>
    <input
      type="number"
      id="discountInput"
      placeholder="Enter discount"
      min="0"
      max="100"
    />
    <button onclick="updateAdmin('discount')">Add Discount</button>
  </div>
</div>

<script>
  async function updateAdmin(field) {
    const spice = document.getElementById("spiceSelect").value;
    if (!spice) {
      alert("Select a spice first");
      return;
    }

    if (field === "price") {
      const price = parseInt(document.getElementById("priceInput").value);
      if (!price) return alert("Enter a valid price");
      await updateSpicePrice(spice, price);
    }

    if (field === "stock") {
      const stock = parseInt(document.getElementById("stockInput").value);
      if (stock === "") return alert("Enter a valid stock");
      await updateSpiceStock(spice, stock);
    }

    if (field === "discount") {
      const discount = parseInt(document.getElementById("discountInput").value);
      if (!discount && discount !== 0) return alert("Enter a valid discount");
      await addDiscount(spice, discount);
    }
  }
</script>
```

---

## 📊 Expected Database Structure

After seeding, MongoDB will have:

```
Collection: products
├── Document 1:
│   ├── id: 1
│   ├── name: "Black Pepper"
│   ├── price: 650
│   ├── stock: 100
│   ├── rating: 4.8
│   └── lastUpdated: 2024-05-08T...
├── Document 2: (White Pepper)
├── Document 3: (Red Chilli)
...
└── Document 35: (Kokum)
```

---

## 🔄 Live Update Flow

```
Admin Panel
    ↓
updateSpicePrice()
    ↓
Sends PUT /api/products/1
    ↓
Backend updates MongoDB
    ↓
Returns updated product
    ↓
Frontend updates products array
    ↓
renderProducts() refreshes UI
    ↓
Customer sees new price instantly! 🎯
```

---

## ✅ Verification Checklist

- [ ] Backend running (`npm start`)
- [ ] MongoDB connected (check server.js output)
- [ ] Database seeded (35 products in MongoDB)
- [ ] API endpoints responding (test with curl)
- [ ] Frontend loading from API (check console)
- [ ] Price updates working (change via API, see in UI)
- [ ] Stock updates working (try "Low Stock" badge)
- [ ] Discounts updating (see price recalculation)
- [ ] Ratings updating (see stars change)

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot POST /api/products/seed/initialize"

**Fix**: Make sure route is registered in server.js:

```javascript
app.use("/api/products", requireDatabase, productRoutes);
```

### Issue: "Connection refused"

**Fix**: Backend not running

```bash
cd backend && npm start
```

### Issue: "E11000 duplicate key error"

**Fix**: Database already seeded. Either:

```bash
# Option 1: Run seed again (it clears first)
# Option 2: Clear collection manually in MongoDB
db.products.deleteMany({})
```

### Issue: Products showing hardcoded values

**Fix**: Make sure you:

1. Removed `const products = [...]`
2. Added `let products = []`
3. Call `initializeProducts()` on load

---

## 📈 Monitor Real-Time Updates

Add this to your page to see live updates:

```javascript
// Auto-refresh every 10 seconds (optional)
setInterval(async () => {
  const fresh = await fetchProductsFromAPI();
  if (fresh) {
    products = fresh;
    renderProducts();
  }
}, 10000);

// Or WebSocket for instant updates (advanced)
```

---

That's it! You now have fully functional real-time spice data! 🎉
