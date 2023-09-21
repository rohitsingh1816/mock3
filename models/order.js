const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  totalAmount: Number,
});

module.exports = mongoose.model('Order', orderSchema);
