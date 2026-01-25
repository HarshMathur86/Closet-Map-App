const express = require('express');
const router = express.Router();
const bwipjs = require('bwip-js');
const PDFDocument = require('pdfkit');
const Bag = require('../models/Bag');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware
router.use(authMiddleware);

// Generate barcode image
const generateBarcodeBuffer = async (text, includeText = false) => {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'code128',
            text: text,
            scale: 3,
            height: 10,
            includetext: includeText,
            textxalign: 'center',
        }, (err, png) => {
            if (err) reject(err);
            else resolve(png);
        });
    });
};

// Export all barcodes as PDF
/**
 * @swagger
 * /export/barcodes:
 *   get:
 *     summary: Export all bag barcodes for the user as a PDF
 *     tags: [Export]
 *     responses:
 *       200:
 *         description: PDF file containing barcodes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No bags found
 *       500:
 *         description: Server error
 */
router.get('/barcodes', async (req, res) => {
    try {
        const bags = await Bag.find({ createdBy: req.userId }).sort({ bagId: 1 });

        if (bags.length === 0) {
            return res.status(404).json({ error: 'No bags found' });
        }

        // Create PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=bag-barcodes.pdf');

        doc.pipe(res);

        // Title
        doc.fontSize(24).text('Bag Barcodes', { align: 'center' });
        doc.moveDown();

        // Generate barcodes for each bag
        const barcodesPerRow = 3;
        const barcodesPerCol = 3;
        const barcodesPerPage = barcodesPerRow * barcodesPerCol;
        const barcodeWidth = 150;
        const barcodeHeight = 210; // Condensed height for 3x3 grid
        const margin = 50;
        const spacingX = 20;
        const spacingY = 30;

        for (let i = 0; i < bags.length; i++) {
            const bag = bags[i];

            // Calculate position
            const col = i % barcodesPerRow;
            const row = Math.floor((i % barcodesPerPage) / barcodesPerRow);

            const x = margin + col * (barcodeWidth + spacingX);
            const y = 80 + row * (barcodeHeight + spacingY);

            // Add new page if needed (9 barcodes per page)
            if (i > 0 && i % barcodesPerPage === 0) {
                doc.addPage();
            }

            try {
                // Generate barcode image (without internal text)
                const barcodeBuffer = await generateBarcodeBuffer(bag.barcodeValue, false);

                // Draw bordered box
                doc.rect(x, y, barcodeWidth, barcodeHeight)
                    .lineWidth(1)
                    .stroke();

                let currentY = y + 20;

                // 1. Bag ID (Big, Bold)
                doc.font('Helvetica-Bold').fontSize(22)
                    .text(bag.bagId, x, currentY, {
                        width: barcodeWidth,
                        align: 'center'
                    });

                currentY += 30;

                // 2. Bag Name
                doc.font('Helvetica').fontSize(12)
                    .text(bag.name, x, currentY, {
                        width: barcodeWidth,
                        align: 'center',
                        ellipsis: true
                    });

                currentY += 25;

                // 3. Barcode Image
                const barcodeImgWidth = barcodeWidth - 30;
                const barcodeImgHeight = 60;
                doc.image(barcodeBuffer, x + (barcodeWidth - barcodeImgWidth) / 2, currentY, {
                    width: barcodeImgWidth,
                    height: barcodeImgHeight
                });

                currentY += barcodeImgHeight + 10;

                // 4. Alphanumeric Code (with space between barcode)
                doc.font('Helvetica').fontSize(8)
                    .text(bag.barcodeValue, x, currentY, {
                        width: barcodeWidth,
                        align: 'center',
                        characterSpacing: 0.5
                    });

            } catch (err) {
                console.error(`Error generating barcode for ${bag.bagId}:`, err);
            }
        }

        // Add footer
        doc.fontSize(10)
            .text(`Generated on ${new Date().toLocaleDateString()}`, 50, 750, {
                align: 'center'
            });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

/**
 * @swagger
 * /export/barcode/{bagId}:
 *   get:
 *     summary: Get a single barcode image for a bag
 *     tags: [Export]
 *     parameters:
 *       - in: path
 *         name: bagId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bag ID (e.g., B1)
 *     responses:
 *       200:
 *         description: Barcode image (PNG)
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Bag not found
 */
router.get('/barcode/:bagId', async (req, res) => {
    try {
        const bag = await Bag.findOne({
            bagId: req.params.bagId,
            createdBy: req.userId
        });

        if (!bag) {
            return res.status(404).json({ error: 'Bag not found' });
        }

        const barcodeBuffer = await generateBarcodeBuffer(bag.barcodeValue, true);

        res.setHeader('Content-Type', 'image/png');
        res.send(barcodeBuffer);
    } catch (error) {
        console.error('Error generating barcode:', error);
        res.status(500).json({ error: 'Failed to generate barcode' });
    }
});

module.exports = router;
