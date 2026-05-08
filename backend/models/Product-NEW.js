const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  origin: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  badge: { type: String, enum: ['popular', 'organic', 'premium', 'sale'] },
  discount: { type: Number, default: 0 },
  filters: [String],
  image: { type: String, required: true },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  stock: { type: Number, default: 100 },
  description: String,
  availability: { 
    type: String, 
    enum: ['In Stock', 'Low Stock', 'Out of Stock'], 
    default: 'In Stock' 
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Index for faster text search
productSchema.index({ name: 'text', origin: 'text' });
productSchema.index({ id: 1 });

module.exports = mongoose.model('Product', productSchema);
