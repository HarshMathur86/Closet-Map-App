const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Bag = require('../models/Bag');
const Cloth = require('../models/Cloth');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all bags for user
router.get('/', async (req, res) => {
    try {
        const bags = await Bag.find({ createdBy: req.userId }).sort({ createdAt: -1 });

        // Get cloth count for each bag
        const bagsWithCount = await Promise.all(
            bags.map(async (bag) => {
                const clothCount = await Cloth.countDocuments({
                    containerBagId: bag.bagId,
                    createdBy: req.userId
                });
                return {
                    ...bag.toObject(),
                    clothCount
                };
            })
        );

        res.json(bagsWithCount);
    } catch (error) {
        console.error('Error fetching bags:', error);
        res.status(500).json({ error: 'Failed to fetch bags' });
    }
});

// Get single bag by ID
router.get('/:bagId', async (req, res) => {
    try {
        const bag = await Bag.findOne({
            bagId: req.params.bagId,
            createdBy: req.userId
        });

        if (!bag) {
            return res.status(404).json({ error: 'Bag not found' });
        }

        const clothCount = await Cloth.countDocuments({
            containerBagId: bag.bagId,
            createdBy: req.userId
        });

        res.json({ ...bag.toObject(), clothCount });
    } catch (error) {
        console.error('Error fetching bag:', error);
        res.status(500).json({ error: 'Failed to fetch bag' });
    }
});

// Create new bag
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Bag name is required' });
        }

        // Auto-generate bagId (B1, B2, etc.)
        const lastBag = await Bag.findOne({ createdBy: req.userId })
            .sort({ createdAt: -1 });

        let nextNumber = 1;
        if (lastBag && lastBag.bagId) {
            const match = lastBag.bagId.match(/B(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        const bagId = `B${nextNumber}`;
        const barcodeValue = `BAG-${uuidv4().substring(0, 8).toUpperCase()}`;

        const bag = new Bag({
            bagId,
            name,
            barcodeValue,
            createdBy: req.userId
        });

        await bag.save();
        res.status(201).json({ ...bag.toObject(), clothCount: 0 });
    } catch (error) {
        console.error('Error creating bag:', error);
        res.status(500).json({ error: 'Failed to create bag' });
    }
});

// Update bag
router.put('/:bagId', async (req, res) => {
    try {
        const { name } = req.body;

        const bag = await Bag.findOneAndUpdate(
            { bagId: req.params.bagId, createdBy: req.userId },
            { name },
            { new: true }
        );

        if (!bag) {
            return res.status(404).json({ error: 'Bag not found' });
        }

        res.json(bag);
    } catch (error) {
        console.error('Error updating bag:', error);
        res.status(500).json({ error: 'Failed to update bag' });
    }
});

// Delete bag
router.delete('/:bagId', async (req, res) => {
    try {
        const bag = await Bag.findOneAndDelete({
            bagId: req.params.bagId,
            createdBy: req.userId
        });

        if (!bag) {
            return res.status(404).json({ error: 'Bag not found' });
        }

        // Also delete all clothes in this bag
        await Cloth.deleteMany({
            containerBagId: req.params.bagId,
            createdBy: req.userId
        });

        res.json({ message: 'Bag deleted successfully' });
    } catch (error) {
        console.error('Error deleting bag:', error);
        res.status(500).json({ error: 'Failed to delete bag' });
    }
});

module.exports = router;
