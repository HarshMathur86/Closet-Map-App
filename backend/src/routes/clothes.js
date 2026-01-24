const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { v2: cloudinary } = require('cloudinary');
const Cloth = require('../models/Cloth');
const Bag = require('../models/Bag');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all clothes for user with filters
router.get('/', async (req, res) => {
    try {
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            color,
            owner,
            category,
            bagId,
            favorite,
            search
        } = req.query;

        let query = { createdBy: req.userId };

        // Apply filters
        if (color) query.color = { $regex: color, $options: 'i' };
        if (owner) query.owner = { $regex: owner, $options: 'i' };
        if (category) query.category = { $regex: category, $options: 'i' };
        if (bagId) query.containerBagId = bagId;
        if (favorite === 'true') query.favorite = true;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { color: { $regex: search, $options: 'i' } },
                { owner: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const clothes = await Cloth.find(query).sort(sortOptions);

        // Attach bag info to each cloth
        const clothesWithBagInfo = await Promise.all(
            clothes.map(async (cloth) => {
                const bag = await Bag.findOne({ bagId: cloth.containerBagId, createdBy: req.userId });
                return {
                    ...cloth.toObject(),
                    bagName: bag ? bag.name : 'Unknown Bag'
                };
            })
        );

        res.json(clothesWithBagInfo);
    } catch (error) {
        console.error('Error fetching clothes:', error);
        res.status(500).json({ error: 'Failed to fetch clothes' });
    }
});

// Get clothes by bag barcode (for scanner)
router.get('/scan/:barcodeValue', async (req, res) => {
    try {
        const bag = await Bag.findOne({
            barcodeValue: req.params.barcodeValue,
            createdBy: req.userId
        });

        if (!bag) {
            return res.status(404).json({ error: 'Bag not found' });
        }

        const clothes = await Cloth.find({
            containerBagId: bag.bagId,
            createdBy: req.userId
        }).sort({ createdAt: -1 });

        res.json({
            bag: { ...bag.toObject() },
            clothes: clothes.map(c => ({ ...c.toObject(), bagName: bag.name }))
        });
    } catch (error) {
        console.error('Error scanning bag:', error);
        res.status(500).json({ error: 'Failed to scan bag' });
    }
});

// Get single cloth
router.get('/:clothId', async (req, res) => {
    try {
        const cloth = await Cloth.findOne({
            clothId: req.params.clothId,
            createdBy: req.userId
        });

        if (!cloth) {
            return res.status(404).json({ error: 'Cloth not found' });
        }

        const bag = await Bag.findOne({ bagId: cloth.containerBagId, createdBy: req.userId });

        res.json({
            ...cloth.toObject(),
            bagName: bag ? bag.name : 'Unknown Bag'
        });
    } catch (error) {
        console.error('Error fetching cloth:', error);
        res.status(500).json({ error: 'Failed to fetch cloth' });
    }
});

// Create new cloth with image upload
router.post('/', async (req, res) => {
    try {
        const { name, imageBase64, color, owner, category, containerBagId, notes } = req.body;

        // Validate required fields
        if (!name || !imageBase64 || !color || !containerBagId) {
            return res.status(400).json({
                error: 'Name, image, color, and bag are required'
            });
        }

        // Verify bag exists
        const bag = await Bag.findOne({ bagId: containerBagId, createdBy: req.userId });
        if (!bag) {
            return res.status(404).json({ error: 'Bag not found' });
        }

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageBase64, {
            folder: `closetmap/${req.userId}/clothes`,
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

        const clothId = `C-${uuidv4().substring(0, 8).toUpperCase()}`;

        const cloth = new Cloth({
            clothId,
            name,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
            color,
            owner: owner || '',
            category: category || '',
            containerBagId,
            notes: notes || '',
            createdBy: req.userId
        });

        await cloth.save();

        res.status(201).json({
            ...cloth.toObject(),
            bagName: bag.name
        });
    } catch (error) {
        console.error('Error creating cloth:', error);
        res.status(500).json({ error: 'Failed to create cloth' });
    }
});

// Update cloth
router.put('/:clothId', async (req, res) => {
    try {
        const { name, color, owner, category, containerBagId, notes, favorite, imageBase64 } = req.body;

        const cloth = await Cloth.findOne({
            clothId: req.params.clothId,
            createdBy: req.userId
        });

        if (!cloth) {
            return res.status(404).json({ error: 'Cloth not found' });
        }

        // Check if bag is being changed
        const bagChanged = containerBagId && containerBagId !== cloth.containerBagId;

        if (bagChanged) {
            // Verify new bag exists
            const newBag = await Bag.findOne({ bagId: containerBagId, createdBy: req.userId });
            if (!newBag) {
                return res.status(404).json({ error: 'New bag not found' });
            }
        }

        // Update image if new one provided
        if (imageBase64) {
            // Delete old image
            await cloudinary.uploader.destroy(cloth.imagePublicId);

            // Upload new image
            const uploadResult = await cloudinary.uploader.upload(imageBase64, {
                folder: `closetmap/${req.userId}/clothes`,
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' }
                ]
            });

            cloth.imageUrl = uploadResult.secure_url;
            cloth.imagePublicId = uploadResult.public_id;
        }

        // Update fields
        if (name) cloth.name = name;
        if (color) cloth.color = color;
        if (owner !== undefined) cloth.owner = owner;
        if (category !== undefined) cloth.category = category;
        if (containerBagId) {
            cloth.containerBagId = containerBagId;
            if (bagChanged) {
                cloth.lastMovedTimestamp = new Date();
            }
        }
        if (notes !== undefined) cloth.notes = notes;
        if (favorite !== undefined) cloth.favorite = favorite;

        await cloth.save();

        const bag = await Bag.findOne({ bagId: cloth.containerBagId, createdBy: req.userId });

        res.json({
            ...cloth.toObject(),
            bagName: bag ? bag.name : 'Unknown Bag'
        });
    } catch (error) {
        console.error('Error updating cloth:', error);
        res.status(500).json({ error: 'Failed to update cloth' });
    }
});

// Toggle favorite
router.patch('/:clothId/favorite', async (req, res) => {
    try {
        const cloth = await Cloth.findOne({
            clothId: req.params.clothId,
            createdBy: req.userId
        });

        if (!cloth) {
            return res.status(404).json({ error: 'Cloth not found' });
        }

        cloth.favorite = !cloth.favorite;
        await cloth.save();

        res.json({ favorite: cloth.favorite });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

// Delete cloth
router.delete('/:clothId', async (req, res) => {
    try {
        const cloth = await Cloth.findOne({
            clothId: req.params.clothId,
            createdBy: req.userId
        });

        if (!cloth) {
            return res.status(404).json({ error: 'Cloth not found' });
        }

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(cloth.imagePublicId);

        await Cloth.deleteOne({ _id: cloth._id });

        res.json({ message: 'Cloth deleted successfully' });
    } catch (error) {
        console.error('Error deleting cloth:', error);
        res.status(500).json({ error: 'Failed to delete cloth' });
    }
});

// Get filter options (unique values)
router.get('/filters/options', async (req, res) => {
    try {
        const colors = await Cloth.distinct('color', { createdBy: req.userId });
        const owners = await Cloth.distinct('owner', { createdBy: req.userId });
        const categories = await Cloth.distinct('category', { createdBy: req.userId });
        const bags = await Bag.find({ createdBy: req.userId }).select('bagId name');

        res.json({
            colors: colors.filter(c => c),
            owners: owners.filter(o => o),
            categories: categories.filter(c => c),
            bags
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
});

module.exports = router;
