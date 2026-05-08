require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
const productRoutes = require('./routes/products');
const projectRoot = path.join(__dirname, '..');
const adminEmail = process.env.ADMIN_EMAIL || 'vikramvikass007@gmail.com';

/* =========================================================
   MIDDLEWARE
========================================================= */
app.use(express.json());
app.use(cors());
app.use('/frontend', express.static(path.join(projectRoot, 'frontend')));
app.use('/pic', express.static(path.join(projectRoot, 'pic')));
app.use('/spieces_image', express.static(path.join(projectRoot, 'spieces_image')));

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'enhanced_site.html'));
});

app.get('/enhanced-site', (req, res) => {
  res.sendFile(path.join(projectRoot, 'enhanced_site.html'));
});

app.get('/Pic.jpeg', (req, res) => {
  res.sendFile(path.join(projectRoot, 'Pic.jpeg'));
});

app.get('/Logo.jpeg', (req, res) => {
  res.sendFile(path.join(projectRoot, 'Logo.jpeg'));
});

app.use('/api/products', requireDatabase, productRoutes);

/* =========================================================
   MONGODB CONNECTION
========================================================= */
let isMongoConnected = false;

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  })
    .then(() => {
      isMongoConnected = true;
      console.log('✅ MongoDB Connected');
    })
    .catch(err => {
      isMongoConnected = false;
      console.error(`❌ MongoDB connection failed: ${err.message}`);
      console.error('Check your MongoDB Atlas Network Access allowlist and MONGO_URI environment variable.');
    });
} else {
  console.warn('⚠️ MONGO_URI is not set. Database-backed APIs will return 503.');
}

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
});

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
});

function requireDatabase(req, res, next) {
  if (isMongoConnected) return next();

  return res.status(503).json({
    success: false,
    message: 'Database is not connected. Check MongoDB Atlas IP allowlist and MONGO_URI.'
  });
}

/* =========================================================
   SCHEMAS
========================================================= */
const inquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  productName: String,
  quantity: String,
  unit: String,
  specialInstructions: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const quoteSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  country: String,
  productType: String,
  quantity: String,
  details: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* =========================================================
   MODELS
========================================================= */
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const Quote = mongoose.model('Quote', quoteSchema);
const Contact = mongoose.model('Contact', contactSchema);

/* =========================================================
   EMAIL SETUP
========================================================= */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/* =========================================================
   HELPER FUNCTIONS
========================================================= */
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

function generateWhatsAppLink(productName, quantity) {
  const message =
    `Hi, I'm interested in ${productName} (${quantity}). Can you send me a quote?`;

  return `https://wa.me/917448361008?text=${encodeURIComponent(message)}`;
}

/* =========================================================
   PRODUCT INQUIRY API
========================================================= */
app.post(
  '/api/inquiries',
  requireDatabase,
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('productName').notEmpty(),
    body('quantity').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    try {
      const inquiry = new Inquiry(req.body);

      await inquiry.save();

      const adminHtml = `
        <h2>New Product Inquiry</h2>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Phone:</strong> ${req.body.phone}</p>
        <p><strong>Product:</strong> ${req.body.productName}</p>
        <p><strong>Quantity:</strong> ${req.body.quantity} ${req.body.unit || ''}</p>
        <p><strong>Instructions:</strong> ${req.body.specialInstructions || 'None'}</p>
      `;

      const customerHtml = `
        <h2>Thank You!</h2>
        <p>Hello ${req.body.name},</p>
        <p>Your inquiry for 
        <strong>${req.body.productName}</strong> 
        has been received.</p>

        <p>We will contact you shortly.</p>

        <a href="https://wa.me/917448361008">
          Chat on WhatsApp
        </a>
      `;

      await sendEmail(
        adminEmail,
        '📦 New Product Inquiry',
        adminHtml
      );

      await sendEmail(
        req.body.email,
        '✅ Inquiry Received',
        customerHtml
      );

      res.json({
        success: true,
        message: 'Inquiry submitted successfully',
        whatsappLink: generateWhatsAppLink(
          req.body.productName,
          req.body.quantity
        )
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================================================
   GET ALL INQUIRIES
========================================================= */
app.get('/api/inquiries', requireDatabase, async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 });

    res.json(inquiries);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================================================
   QUOTE REQUEST API
========================================================= */
app.post(
  '/api/quotes',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('productType').notEmpty(),
    body('quantity').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    try {
      if (isMongoConnected) {
        const quote = new Quote(req.body);
        await quote.save();
      }

      await sendEmail(
        adminEmail,
        '💼 New Quote Request',
        `<h2>New Quote Request</h2>
         <p><strong>Name:</strong> ${req.body.name}</p>
         <p><strong>Email:</strong> ${req.body.email}</p>
         <p><strong>Company:</strong> ${req.body.company || '-'}</p>
         <p><strong>Country:</strong> ${req.body.country || '-'}</p>
         <p><strong>Product:</strong> ${req.body.productType}</p>
         <p><strong>Quantity:</strong> ${req.body.quantity} kg</p>
         <p><strong>Details:</strong> ${req.body.details || '-'}</p>`
      );

      res.json({
        success: true,
        message: isMongoConnected
          ? 'Quote request submitted'
          : 'Quote email sent. Database is currently disconnected, so it was not saved.'
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================================================
   CONTACT FORM API
========================================================= */
app.post(
  '/api/contact',
  requireDatabase,
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('message').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    try {
      const contact = new Contact(req.body);

      await contact.save();

      await sendEmail(
        adminEmail,
        '💬 Contact Form Message',
        `
          <h2>New Contact Message</h2>
          <p>${req.body.message}</p>
        `
      );

      res.json({
        success: true,
        message: 'Message sent successfully'
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================================================
   DASHBOARD API
========================================================= */
app.get('/api/dashboard', requireDatabase, async (req, res) => {
  try {
    const inquiriesCount = await Inquiry.countDocuments();
    const quotesCount = await Quote.countDocuments();
    const contactsCount = await Contact.countDocuments();

    res.json({
      inquiriesCount,
      quotesCount,
      contactsCount
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================================================
   HEALTH CHECK
========================================================= */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    database: isMongoConnected ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ Server Running',
    database: isMongoConnected ? 'connected' : 'disconnected'
  });
});

/* =========================================================
   START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║ 🌶️ TamilEelam Backend Running       ║
║ 🚀 http://localhost:${PORT}         ║
╚══════════════════════════════════════╝
  `);
});
