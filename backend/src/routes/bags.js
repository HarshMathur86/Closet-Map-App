const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Bag = require('../models/Bag');
const Cloth = require('../models/Cloth');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Bag:
 *       type: object
 *       required:
 *         - bagId
 *         - name
 *         - barcodeValue
 *         - createdBy
 *       properties:
 *         bagId:
 *           type: string
 *           description: Unique identifier for the bag (e.g., B1, B2)
 *         name:
 *           type: string
 *           description: Name of the bag
 *         barcodeValue:
 *           type: string
 *           description: Generated barcode value for the bag
 *         createdBy:
 *           type: string
 *           description: Firebase User ID of the owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the bag was created
 *         clothCount:
 *           type: integer
 *           description: Number of clothes currently in this bag
 *       example:
 *         bagId: "B1"
 *         name: "Blue Suitcase"
 *         barcodeValue: "BAG-A1B2C3D4"
 *         createdBy: "user123"
 *         createdAt: "2024-01-25T10:00:00.000Z"
 *         clothCount: 5
 */

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /bags:
 *   get:
 *     summary: Get all bags for the authenticated user
 *     tags: [Bags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bags fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bag'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /bags/{bagId}:
 *   get:
 *     summary: Get a single bag by its ID
 *     tags: [Bags]
 *     parameters:
 *       - in: path
 *         name: bagId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bag ID (e.g., B1)
 *     responses:
 *       200:
 *         description: Bag details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bag'
 *       404:
 *         description: Bag not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /bags:
 *   post:
 *     summary: Create a new bag
 *     tags: [Bags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the new bag
 *             example:
 *               name: "Travel Backpack"
 *     responses:
 *       201:
 *         description: Bag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bag'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /bags/{bagId}:
 *   put:
 *     summary: Update an existing bag's details
 *     tags: [Bags]
 *     parameters:
 *       - in: path
 *         name: bagId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bag ID (e.g., B1)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the bag
 *             example:
 *               name: "Updated Luggage Name"
 *     responses:
 *       200:
 *         description: Bag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bag'
 *       404:
 *         description: Bag not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /bags/{bagId}:
 *   delete:
 *     summary: Delete a bag and all its contents
 *     tags: [Bags]
 *     parameters:
 *       - in: path
 *         name: bagId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bag ID to delete
 *     responses:
 *       200:
 *         description: Bag and its clothes deleted successfully
 *       404:
 *         description: Bag not found
 *       500:
 *         description: Server error
 */
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
