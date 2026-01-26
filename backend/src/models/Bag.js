const mongoose = require('mongoose');

const bagSchema = new mongoose.Schema({
    bagId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    barcodeValue: {
        type: String,
        required: true
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

// Index for faster queries and per-user uniqueness
bagSchema.index({ createdBy: 1, bagId: 1 }, { unique: true });
bagSchema.index({ createdBy: 1, barcodeValue: 1 }, { unique: true });

module.exports = mongoose.model('Bag', bagSchema);
