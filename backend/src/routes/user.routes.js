const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get("/users", (req, res) => {
    res.json([]);
});

module.exports = router;
