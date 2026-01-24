const mongoose = require('mongoose');

const clothSchema = new mongoose.Schema({
    clothId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    imagePublicId: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    containerBagId: {
        type: String,
        required: true,
        index: true
    },
    lastMovedTimestamp: {
        type: Date,
        default: Date.now
    },
    favorite: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
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

// Indexes for faster queries
clothSchema.index({ createdBy: 1, containerBagId: 1 });
clothSchema.index({ createdBy: 1, favorite: 1 });
clothSchema.index({ createdBy: 1, name: 'text' });

module.exports = mongoose.model('Cloth', clothSchema);
