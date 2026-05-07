# 🌶️ TamilEelam Export House - Backend Setup Guide

## 📋 Quick Start (5 Minutes)

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Create .env File**
```bash
cp .env.example .env
```

### **Step 3: Configure Gmail**
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** + **Windows Computer**
3. Copy the **16-character password**
4. Paste in `.env` file:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### **Step 4: Setup MongoDB**

**Option A: Local MongoDB**
```bash
# Install MongoDB locally, then update .env:
MONGO_URI=mongodb://localhost:27017/tamilEelam
```

**Option B: MongoDB Cloud (Free)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Get connection string
5. Update `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tamilEelam
```

### **Step 5: Start Server**
```bash
npm start
```

✅ Server runs on: `http://localhost:5000`

---

## 🔗 API Endpoints

### **1. Send Product Inquiry**
**POST** `/api/inquiries`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "productName": "Black Pepper",
  "quantity": "100",
  "unit": "kg",
  "specialInstructions": "Premium grade only"
}
```

Response:
```json
{
  "success": true,
  "message": "Inquiry received! Check your email.",
  "whatsappLink": "https://wa.me/919876543210?text=..."
}
```

---

### **2. Get All Inquiries (Admin)**
**GET** `/api/inquiries`

Response:
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "productName": "Black Pepper",
    "quantity": "100",
    "createdAt": "2026-05-07T10:30:00Z"
  }
]
```

---

### **3. Send Quote Request**
**POST** `/api/quotes`

Request:
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "company": "ABC Imports",
  "country": "United States",
  "productType": "Turmeric",
  "quantity": "500",
  "details": "Need bulk order for retail distribution"
}
```

Response:
```json
{
  "success": true,
  "message": "Quote request submitted!"
}
```

---

### **4. Get All Quotes (Admin)**
**GET** `/api/quotes`

---

### **5. Send Contact Message**
**POST** `/api/contact`

Request:
```json
{
  "name": "Contact Name",
  "email": "contact@example.com",
  "message": "Your message here"
}
```

---

### **6. Admin Dashboard**
**GET** `/api/dashboard`

Response:
```json
{
  "stats": {
    "inquiriesCount": 25,
    "quotesCount": 12,
    "contactsCount": 8
  },
  "recentInquiries": [...],
  "recentQuotes": [...]
}
```

---

### **7. Health Check**
**GET** `/api/health`

Response:
```json
{
  "status": "✅ Server is running"
}
```

---

## 🎯 Frontend Integration

### **Add Script to HTML**
```html
<!-- In your enhanced_site.html -->
<script src="js/apiIntegration.js"></script>
```

### **Example: Connect "Buy Now" Button**

```html
<!-- In Quick Buy Modal -->
<form onsubmit="handleQuickBuy(event)">
  <input type="text" id="qbName" placeholder="Your Name" required>
  <input type="email" id="qbEmail" placeholder="Your Email" required>
  <input type="tel" id="qbPhone" placeholder="Phone" required>
  <input type="number" id="qbQty" placeholder="Quantity" required>
  <button type="submit">Buy Now</button>
</form>

<script>
function handleQuickBuy(event) {
  event.preventDefault();
  
  const data = {
    name: document.getElementById('qbName').value,
    email: document.getElementById('qbEmail').value,
    phone: document.getElementById('qbPhone').value,
    productName: 'Black Pepper', // Get from product data
    quantity: document.getElementById('qbQty').value,
    unit: 'kg',
    specialInstructions: ''
  };
  
  sendProductInquiry(data);
}
</script>
```

### **Example: Connect Quote Form**

```html
<form onsubmit="handleQuoteSubmit(event)">
  <input type="text" id="quoteName" placeholder="Full Name" required>
  <input type="email" id="quoteEmail" placeholder="Email" required>
  <input type="text" id="quoteCompany" placeholder="Company">
  <select id="quoteCountry" required>
    <option>Select Country</option>
    <option>India</option>
    <option>USA</option>
  </select>
  <select id="quoteProduct" required>
    <option>Select Product</option>
    <option>Black Pepper</option>
    <option>Turmeric</option>
  </select>
  <input type="number" id="quoteQty" placeholder="Quantity (kg)" required>
  <textarea id="quoteDetails" placeholder="Requirements"></textarea>
  <button type="submit">Send Quote Request</button>
</form>

<script>
function handleQuoteSubmit(event) {
  event.preventDefault();
  
  const data = {
    name: document.getElementById('quoteName').value,
    email: document.getElementById('quoteEmail').value,
    company: document.getElementById('quoteCompany').value,
    country: document.getElementById('quoteCountry').value,
    productType: document.getElementById('quoteProduct').value,
    quantity: document.getElementById('quoteQty').value,
    details: document.getElementById('quoteDetails').value
  };
  
  sendQuoteRequest(data);
}
</script>
```

---

## 📧 Email Templates

Customer receives:
```
Subject: ✅ Inquiry Received

Hi John,

Thank you for your inquiry about Black Pepper (100 kg).
Our team will contact you soon via email or WhatsApp.

[WhatsApp Chat Link]

Best regards,
TamilEelam Export House
```

Admin receives:
```
Subject: 📦 New Product Inquiry

Name: John Doe
Email: john@example.com
Phone: +91 98765 43210
Product: Black Pepper
Quantity: 100 kg

[Message on WhatsApp]
```

---

## 🚀 Deployment (Railway.app)

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Add backend server"
git push origin main
```

### **Step 2: Create Railway Account**
- Go to: https://railway.app
- Sign up with GitHub

### **Step 3: Deploy**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repo
4. Click Deploy

### **Step 4: Add Environment Variables**
1. Go to Variables tab
2. Add all `.env` variables:
   - `PORT=5000`
   - `MONGO_URI=...`
   - `EMAIL_USER=...`
   - `EMAIL_PASSWORD=...`
   - `ADMIN_EMAIL=...`

### **Step 5: Get Live URL**
Railway provides a live URL like: `https://your-app.railway.app`

Update in frontend:
```javascript
// In apiIntegration.js
const API_URL = 'https://your-app.railway.app/api';
```

---

## 🧪 Testing with Curl

### **Test Product Inquiry**
```bash
curl -X POST http://localhost:5000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+91 98765 43210",
    "productName": "Black Pepper",
    "quantity": "50",
    "unit": "kg"
  }'
```

### **Test Get Inquiries**
```bash
curl http://localhost:5000/api/inquiries
```

### **Test Health Check**
```bash
curl http://localhost:5000/api/health
```

---

## ❌ Troubleshooting

### **Problem: "Cannot find module 'express'"**
```bash
npm install
```

### **Problem: "Gmail authentication failed"**
1. Enable 2FA on Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate new app password
4. Update `.env` with new password

### **Problem: "MongoDB connection failed"**
1. Check MongoDB is running (local)
2. Or verify cloud connection string
3. Test with: `mongo "your_connection_string"`

### **Problem: "CORS error from frontend"**
Already configured! CORS is enabled for all origins.

### **Problem: "Port already in use"**
```bash
# Change PORT in .env
PORT=3001
```

---

## 📱 What Happens When Customer Orders

1. ✅ Customer fills form with name, email, phone, product, qty
2. ✅ Frontend calls `sendProductInquiry(data)`
3. ✅ Backend saves to MongoDB
4. ✅ Backend sends email to **Admin** with WhatsApp link
5. ✅ Backend sends confirmation email to **Customer**
6. ✅ Customer sees WhatsApp popup
7. ✅ Customer can chat directly or wait for email reply
8. ✅ Admin can see all inquiries on `/api/inquiries`

---

## 📊 Admin Dashboard

View all customer inquiries:
```
GET /api/dashboard
```

Shows:
- Total inquiries count
- Total quotes count
- Total contacts count
- Last 5 recent inquiries
- Last 5 recent quotes

---

## 🔒 Security Notes

- ✅ Input validation enabled (express-validator)
- ✅ CORS configured
- ✅ Environment variables protected
- ⚠️ Add rate limiting in production
- ⚠️ Add authentication for admin endpoints
- ⚠️ Use HTTPS in production

---

## 📞 Support

Need help?
- Check `.env.example` for all required variables
- Ensure MongoDB is running
- Check server logs for errors
- Verify Gmail app password is correct

---

**Happy Ordering! 🌶️🎉**
