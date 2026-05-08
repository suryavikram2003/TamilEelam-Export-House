const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// All 35 spices data
const SPICES_DATA = [
  { id: 1, name: 'Black Pepper', origin: 'Western Ghats', price: 650, unit: 'kg', badge: 'popular', discount: 10, filters: ['popular'], image: 'Black Pepper.jpeg', rating: 4.8, reviews: 142 },
  { id: 2, name: 'White Pepper', origin: 'Kerala', price: 750, unit: 'kg', badge: 'popular', discount: 5, filters: ['popular'], image: 'White Pepper.jpeg', rating: 4.9, reviews: 98 },
  { id: 3, name: 'Red Chilli (Whole)', origin: 'Guntur', price: 280, unit: 'kg', badge: 'sale', discount: 15, filters: ['premium'], image: 'Red Chilli (Whole).jpeg', rating: 4.7, reviews: 201 },
  { id: 4, name: 'Kashmiri Chilli', origin: 'Kashmir', price: 420, unit: 'kg', badge: 'organic', discount: 8, filters: ['organic'], image: 'Kashmiri Chilli.jpeg', rating: 4.8, reviews: 89 },
  { id: 5, name: 'Turmeric (Whole)', origin: 'Erode', price: 180, unit: 'kg', badge: 'organic', discount: 12, filters: ['organic'], image: 'Turmeric (Whole).jpeg', rating: 4.9, reviews: 312 },
  { id: 6, name: 'Turmeric Powder', origin: 'Erode', price: 200, unit: 'kg', badge: 'organic', discount: 10, filters: ['organic'], image: 'Turmeric Powder.jpeg', rating: 4.8, reviews: 267 },
  { id: 7, name: 'Cumin Seeds', origin: 'Rajasthan', price: 310, unit: 'kg', badge: 'popular', discount: 0, filters: ['popular', 'premium'], image: 'Cumin Seeds.jpeg', rating: 4.7, reviews: 156 },
  { id: 8, name: 'Coriander Seeds', origin: 'Rajasthan', price: 220, unit: 'kg', badge: 'popular', discount: 7, filters: ['popular'], image: 'Coriander Seeds.jpeg', rating: 4.8, reviews: 178 },
  { id: 9, name: 'Coriander Powder', origin: 'Tamil Nadu', price: 240, unit: 'kg', badge: 'popular', discount: 6, filters: ['popular'], image: 'Coriander Powder.jpeg', rating: 4.7, reviews: 188 },
  { id: 10, name: 'Cardamom (Green)', origin: 'Idukki, Kerala', price: 1400, unit: 'kg', badge: 'popular', discount: 5, filters: ['premium'], image: 'Cardamom (Green).jpeg', rating: 4.9, reviews: 289 },
  { id: 11, name: 'Cardamom (Black)', origin: 'Guatemala', price: 1600, unit: 'kg', badge: 'premium', discount: 8, filters: ['premium'], image: 'Cardamom (Green).jpeg', rating: 4.8, reviews: 145 },
  { id: 12, name: 'Cloves', origin: 'Kerala', price: 850, unit: 'kg', badge: 'premium', discount: 8, filters: ['premium'], image: 'Black Pepper.jpeg', rating: 4.8, reviews: 134 },
  { id: 13, name: 'Cinnamon', origin: 'Tamil Nadu', price: 420, unit: 'kg', badge: 'premium', discount: 10, filters: ['premium'], image: 'Red Chilli (Whole).jpeg', rating: 4.7, reviews: 167 },
  { id: 14, name: 'Bay Leaf', origin: 'Himalayas', price: 380, unit: 'kg', badge: 'premium', discount: 7, filters: ['premium'], image: 'Coriander Seeds.jpeg', rating: 4.7, reviews: 92 },
  { id: 15, name: 'Mustard Seeds', origin: 'Tamil Nadu', price: 160, unit: 'kg', badge: 'organic', discount: 4, filters: ['organic'], image: 'Cumin Seeds.jpeg', rating: 4.6, reviews: 121 },
  { id: 16, name: 'Fenugreek Seeds', origin: 'Tamil Nadu', price: 140, unit: 'kg', badge: 'organic', discount: 0, filters: ['organic'], image: 'Coriander Seeds.jpeg', rating: 4.6, reviews: 104 },
  { id: 17, name: 'Fennel Seeds', origin: 'Tamil Nadu', price: 180, unit: 'kg', badge: 'organic', discount: 5, filters: ['organic'], image: 'Cumin Seeds.jpeg', rating: 4.8, reviews: 147 },
  { id: 18, name: 'Star Anise', origin: 'Tamil Nadu', price: 350, unit: 'kg', badge: 'premium', discount: 6, filters: ['premium'], image: 'Coriander Seeds.jpeg', rating: 4.7, reviews: 84 },
  { id: 19, name: 'Nutmeg', origin: 'Kerala', price: 620, unit: 'kg', badge: 'premium', discount: 9, filters: ['premium'], image: 'Cumin Seeds.jpeg', rating: 4.8, reviews: 116 },
  { id: 20, name: 'Mace', origin: 'Kerala', price: 680, unit: 'kg', badge: 'premium', discount: 7, filters: ['premium'], image: 'Turmeric (Whole).jpeg', rating: 4.7, reviews: 78 },
  { id: 21, name: 'Asafoetida (Hing)', origin: 'Uttar Pradesh', price: 1200, unit: 'kg', badge: 'premium', discount: 10, filters: ['premium'], image: 'Coriander Powder.jpeg', rating: 4.9, reviews: 67 },
  { id: 22, name: 'Curry Leaves (Dry)', origin: 'Tamil Nadu', price: 320, unit: 'kg', badge: 'organic', discount: 4, filters: ['organic'], image: 'Coriander Powder.jpeg', rating: 4.6, reviews: 95 },
  { id: 23, name: 'Tamarind', origin: 'Tamil Nadu', price: 280, unit: 'kg', badge: 'popular', discount: 3, filters: ['popular'], image: 'Turmeric (Whole).jpeg', rating: 4.7, reviews: 155 },
  { id: 24, name: 'Garlic (Dry)', origin: 'Tamil Nadu', price: 240, unit: 'kg', badge: 'organic', discount: 5, filters: ['organic'], image: 'Coriander Powder.jpeg', rating: 4.5, reviews: 118 },
  { id: 25, name: 'Ginger (Dry)', origin: 'Tamil Nadu', price: 350, unit: 'kg', badge: 'popular', discount: 8, filters: ['popular'], image: 'Turmeric (Whole).jpeg', rating: 4.6, reviews: 132 },
  { id: 26, name: 'Paprika', origin: 'Rajasthan', price: 320, unit: 'kg', badge: 'organic', discount: 6, filters: ['organic'], image: 'Red Chilli (Whole).jpeg', rating: 4.7, reviews: 98 },
  { id: 27, name: 'Saffron', origin: 'Kashmir', price: 3500, unit: 'kg', badge: 'premium', discount: 15, filters: ['premium'], image: 'Turmeric Powder.jpeg', rating: 4.9, reviews: 76 },
  { id: 28, name: 'Vanilla', origin: 'Madagascar', price: 2800, unit: 'kg', badge: 'premium', discount: 12, filters: ['premium'], image: 'Coriander Seeds.jpeg', rating: 4.8, reviews: 89 },
  { id: 29, name: 'Sesame Seeds', origin: 'Tamil Nadu', price: 320, unit: 'kg', badge: 'organic', discount: 7, filters: ['organic'], image: 'Coriander Seeds.jpeg', rating: 4.8, reviews: 173 },
  { id: 30, name: 'Poppy Seeds', origin: 'Rajasthan', price: 280, unit: 'kg', badge: 'organic', discount: 4, filters: ['organic'], image: 'Coriander Seeds.jpeg', rating: 4.6, reviews: 76 },
  { id: 31, name: 'Carom Seeds (Ajwain)', origin: 'Rajasthan', price: 240, unit: 'kg', badge: 'popular', discount: 5, filters: ['popular'], image: 'Cumin Seeds.jpeg', rating: 4.7, reviews: 102 },
  { id: 32, name: 'Black Cumin (Kalonji)', origin: 'Rajasthan', price: 380, unit: 'kg', badge: 'organic', discount: 6, filters: ['organic'], image: 'Cumin Seeds.jpeg', rating: 4.8, reviews: 94 },
  { id: 33, name: 'Dried Rose Petals', origin: 'Kashmir', price: 580, unit: 'kg', badge: 'premium', discount: 8, filters: ['premium'], image: 'Red Chilli (Whole).jpeg', rating: 4.7, reviews: 112 },
  { id: 34, name: 'Allspice', origin: 'Jamaica', price: 420, unit: 'kg', badge: 'premium', discount: 7, filters: ['premium'], image: 'Black Pepper.jpeg', rating: 4.6, reviews: 68 },
  { id: 35, name: 'Kokum', origin: 'Karnataka', price: 480, unit: 'kg', badge: 'organic', discount: 5, filters: ['organic'], image: 'Turmeric (Whole).jpeg', rating: 4.7, reviews: 87 }
];

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed initial products to database (run once)
router.post('/seed/initialize', async (req, res) => {
  try {
    await Product.deleteMany({}); // Clear existing
    const created = await Product.insertMany(SPICES_DATA);
    res.status(201).json({ 
      message: `Successfully seeded ${created.length} spices`,
      count: created.length 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update product (for real-time price/stock changes)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: 'Product deleted', product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
