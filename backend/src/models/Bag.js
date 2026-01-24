const mongoose = require('mongoose');

const bagSchema = new mongoose.Schema({
    bagId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    barcodeValue: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
bagSchema.index({ createdBy: 1, bagId: 1 });

module.exports = mongoose.model('Bag', bagSchema);
