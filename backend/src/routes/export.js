const express = require('express');
const router = express.Router();
const bwipjs = require('bwip-js');
const PDFDocument = require('pdfkit');
const Bag = require('../models/Bag');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware
router.use(authMiddleware);

// Generate barcode image
const generateBarcodeBuffer = async (text) => {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'code128',
            text: text,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
        }, (err, png) => {
            if (err) reject(err);
            else resolve(png);
        });
    });
};

// Export all barcodes as PDF
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
        const barcodesPerRow = 2;
        const barcodeWidth = 220;
        const barcodeHeight = 120;
        const margin = 50;
        const spacing = 30;

        for (let i = 0; i < bags.length; i++) {
            const bag = bags[i];

            // Calculate position
            const col = i % barcodesPerRow;
            const row = Math.floor((i % 4) / barcodesPerRow);

            const x = margin + col * (barcodeWidth + spacing);
            const y = 120 + row * (barcodeHeight + 60);

            // Add new page if needed (4 barcodes per page)
            if (i > 0 && i % 4 === 0) {
                doc.addPage();
            }

            try {
                // Generate barcode image
                const barcodeBuffer = await generateBarcodeBuffer(bag.barcodeValue);

                // Draw box
                doc.rect(x - 10, y - 30, barcodeWidth + 20, barcodeHeight + 50)
                    .stroke();

                // Draw bag info
                doc.fontSize(14)
                    .text(`${bag.bagId}: ${bag.name}`, x, y - 20, {
                        width: barcodeWidth,
                        align: 'center'
                    });

                // Draw barcode
                doc.image(barcodeBuffer, x + 10, y + 10, {
                    width: barcodeWidth - 20,
                    height: 60
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

// Get single barcode image
router.get('/barcode/:bagId', async (req, res) => {
    try {
        const bag = await Bag.findOne({
            bagId: req.params.bagId,
            createdBy: req.userId
        });

        if (!bag) {
            return res.status(404).json({ error: 'Bag not found' });
        }

        const barcodeBuffer = await generateBarcodeBuffer(bag.barcodeValue);

        res.setHeader('Content-Type', 'image/png');
        res.send(barcodeBuffer);
    } catch (error) {
        console.error('Error generating barcode:', error);
        res.status(500).json({ error: 'Failed to generate barcode' });
    }
});

module.exports = router;
