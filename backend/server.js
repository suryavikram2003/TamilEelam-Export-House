require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();

// ============ MIDDLEWARE ============
app.use(express.json());
app.use(cors());

// ============ MONGODB CONNECTION ============
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Connected')).catch(err => console.log('❌ MongoDB Error:', err));

// ============ SCHEMAS ============
const inquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  productName: String,
  quantity: String,
  unit: String,
  specialInstructions: String,
  createdAt: { type: Date, default: Date.now }
});

const quoteSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  country: String,
  productType: String,
  quantity: String,
  details: String,
  createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

// ============ MODELS ============
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const Quote = mongoose.model('Quote', quoteSchema);
const Contact = mongoose.model('Contact', contactSchema);

// ============ EMAIL SETUP ============
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ============ HELPER: SEND EMAIL ============
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email Error:', error);
  }
}

// ============ HELPER: WHATSAPP LINK ============
function generateWhatsAppLink(phone, productName, quantity) {
  const message = `Hi, I'm interested in ${productName} (${quantity}). Can you send me a quote?`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/919876543210?text=${encoded}`;
}

// ============ API: PRODUCT INQUIRY ============
app.post('/api/inquiries', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('productName').notEmpty(),
  body('quantity').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const inquiry = new Inquiry(req.body);
    await inquiry.save();

    // EMAIL TO ADMIN
    const adminHtml = `
      <h2>New Product Inquiry</h2>
      <p><strong>Name:</strong> ${req.body.name}</p>
      <p><strong>Email:</strong> ${req.body.email}</p>
      <p><strong>Phone:</strong> ${req.body.phone}</p>
      <p><strong>Product:</strong> ${req.body.productName}</p>
      <p><strong>Quantity:</strong> ${req.body.quantity} ${req.body.unit}</p>
      <p><strong>Special Instructions:</strong> ${req.body.specialInstructions || 'None'}</p>
      <hr>
      <a href="https://wa.me/${req.body.phone.replace(/\D/g, '')}?text=Hi%20${req.body.name}%2C%20Thanks%20for%20your%20interest%20in%20${req.body.productName}">
        Message on WhatsApp
      </a>
    `;

    // EMAIL TO CUSTOMER
    const customerHtml = `
      <h2>Thank you for your inquiry!</h2>
      <p>Hi ${req.body.name},</p>
      <p>We received your inquiry for <strong>${req.body.productName}</strong> (${req.body.quantity} ${req.body.unit}).</p>
      <p>Our team will contact you soon via email or WhatsApp.</p>
      <p>Or chat with us directly:</p>
      <a href="https://wa.me/919876543210">WhatsApp Chat</a>
      <hr>
      <p>Best regards,<br>TamilEelam Export House</p>
    `;

    await sendEmail(process.env.ADMIN_EMAIL, '📦 New Product Inquiry', adminHtml);
    await sendEmail(req.body.email, '✅ Inquiry Received', customerHtml);

    res.json({ 
      success: true, 
      message: 'Inquiry received! Check your email.', 
      whatsappLink: generateWhatsAppLink(req.body.phone, req.body.productName, req.body.quantity)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ API: GET ALL INQUIRIES (ADMIN) ============
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ API: QUOTE REQUEST ============
app.post('/api/quotes', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('productType').notEmpty(),
  body('quantity').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const quote = new Quote(req.body);
    await quote.save();

    const adminHtml = `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${req.body.name}</p>
      <p><strong>Email:</strong> ${req.body.email}</p>
      <p><strong>Company:</strong> ${req.body.company || 'N/A'}</p>
      <p><strong>Country:</strong> ${req.body.country}</p>
      <p><strong>Product Type:</strong> ${req.body.productType}</p>
      <p><strong>Quantity:</strong> ${req.body.quantity} kg</p>
      <p><strong>Details:</strong> ${req.body.details}</p>
    `;

    const customerHtml = `
      <h2>Quote Request Received</h2>
      <p>Hi ${req.body.name},</p>
      <p>We received your quote request for <strong>${req.body.quantity}kg of ${req.body.productType}</strong>.</p>
      <p>Our team will send you a customized quote within 24 hours.</p>
      <hr>
      <p>TamilEelam Export House</p>
    `;

    await sendEmail(process.env.ADMIN_EMAIL, '💼 New Quote Request', adminHtml);
    await sendEmail(req.body.email, '📧 Quote Request Received', customerHtml);

    res.json({ success: true, message: 'Quote request submitted!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ API: GET ALL QUOTES (ADMIN) ============
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ API: CONTACT FORM ============
app.post('/api/contact', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('message').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const contact = new Contact(req.body);
    await contact.save();

    const adminHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${req.body.name}</p>
      <p><strong>Email:</strong> ${req.body.email}</p>
      <p><strong>Message:</strong><br>${req.body.message}</p>
    `;

    await sendEmail(process.env.ADMIN_EMAIL, '💬 New Contact Message', adminHtml);

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN DASHBOARD API ============
app.get('/api/dashboard', async (req, res) => {
  try {
    const inquiriesCount = await Inquiry.countDocuments();
    const quotesCount = await Quote.countDocuments();
    const contactsCount = await Contact.countDocuments();
    const recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(5);
    const recentQuotes = await Quote.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: { inquiriesCount, quotesCount, contactsCount },
      recentInquiries,
      recentQuotes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Server is running' });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║  🌶️  TamilEelam Backend Running      ║
  ║  🚀  http://localhost:${PORT}        ║
  ║  📧  Email: ${process.env.EMAIL_USER}    ║
  ╚═══════════════════════════════════════╝
  `);
});
