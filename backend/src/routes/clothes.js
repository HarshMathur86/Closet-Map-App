const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { v2: cloudinary } = require('cloudinary');
const Cloth = require('../models/Cloth');
const Bag = require('../models/Bag');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Cloth:
 *       type: object
 *       required:
 *         - clothId
 *         - name
 *         - imageUrl
 *         - color
 *         - containerBagId
 *         - createdBy
 *       properties:
 *         clothId:
 *           type: string
 *           description: Unique identifier for the cloth (e.g., C-A1B2C3D4)
 *         name:
 *           type: string
 *           description: Name of the item
 *         imageUrl:
 *           type: string
 *           description: Cloudinary URL of the image
 *         imagePublicId:
 *           type: string
 *           description: Cloudinary public ID for the image
 *         color:
 *           type: string
 *           description: Primary color of the item
 *         owner:
 *           type: string
 *           description: Owner of the item (e.g., Person A, Person B)
 *         category:
 *           type: string
 *           description: Category of the item (e.g., T-Shirt, Jeans)
 *         containerBagId:
 *           type: string
 *           description: ID of the bag containing this item
 *         bagName:
 *           type: string
 *           description: Name of the bag containing this item (populated on fetch)
 *         lastMovedTimestamp:
 *           type: string
 *           format: date-time
 *           description: When the item was last moved between bags
 *         favorite:
 *           type: boolean
 *           description: Whether the item is marked as favorite
 *         notes:
 *           type: string
 *           description: Additional notes about the item
 *         createdBy:
 *           type: string
 *           description: Firebase User ID of the owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the item was created
 *       example:
 *         clothId: "C-A1B2C3D4"
 *         name: "Blue Denim Jeans"
 *         imageUrl: "https://res.cloudinary.com/..."
 *         color: "Blue"
 *         owner: "Harsh"
 *         category: "Jeans"
 *         containerBagId: "B1"
 *         bagName: "Main Suitcase"
 *         favorite: true
 *         notes: "Leis jeans"
 */

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /clothes:
 *   get:
 *     summary: Get all clothes for the authenticated user with filters
 *     tags: [Clothes]
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: bagId
 *         schema:
 *           type: string
 *       - in: query
 *         name: favorite
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, color, owner, or category
 *     responses:
 *       200:
 *         description: List of clothes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cloth'
 */
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

/**
 * @swagger
 * /clothes/scan/{barcodeValue}:
 *   get:
 *     summary: Get clothes in a bag by scanning its barcode
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: barcodeValue
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode value of the bag
 *     responses:
 *       200:
 *         description: Bag and its clothes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bag:
 *                   $ref: '#/components/schemas/Bag'
 *                 clothes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cloth'
 *       404:
 *         description: Bag not found
 */
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

/**
 * @swagger
 * /clothes/{clothId}:
 *   get:
 *     summary: Get a single cloth item by its ID
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cloth details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cloth'
 *       404:
 *         description: Cloth not found
 */
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

/**
 * @swagger
 * /clothes:
 *   post:
 *     summary: Create a new cloth item with image upload
 *     tags: [Clothes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - imageBase64
 *               - color
 *               - containerBagId
 *             properties:
 *               name:
 *                 type: string
 *               imageBase64:
 *                 type: string
 *                 description: Base64 string of the item image
 *               color:
 *                 type: string
 *               owner:
 *                 type: string
 *               category:
 *                 type: string
 *               containerBagId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cloth created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cloth'
 *       400:
 *         description: Missing required fields
 */
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

/**
 * @swagger
 * /clothes/{clothId}:
 *   put:
 *     summary: Update an existing cloth item
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               owner:
 *                 type: string
 *               category:
 *                 type: string
 *               containerBagId:
 *                 type: string
 *               notes:
 *                 type: string
 *               favorite:
 *                 type: boolean
 *               imageBase64:
 *                 type: string
 *                 description: New Base64 image (optional)
 *     responses:
 *       200:
 *         description: Cloth updated successfully
 */
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

/**
 * @swagger
 * /clothes/{clothId}/favorite:
 *   patch:
 *     summary: Toggle favorite status of a cloth item
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorite:
 *                   type: boolean
 */
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

/**
 * @swagger
 * /clothes/{clothId}:
 *   delete:
 *     summary: Delete a cloth item
 *     tags: [Clothes]
 *     parameters:
 *       - in: path
 *         name: clothId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cloth deleted successfully
 */
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

/**
 * @swagger
 * /clothes/filters/options:
 *   get:
 *     summary: Get unique values for filters (colors, owners, categories, bags)
 *     tags: [Clothes]
 *     responses:
 *       200:
 *         description: Filter options fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 colors: { type: array, items: { type: string } }
 *                 owners: { type: array, items: { type: string } }
 *                 categories: { type: array, items: { type: string } }
 *                 bags: { type: array, items: { $ref: '#/components/schemas/Bag' } }
 */
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
