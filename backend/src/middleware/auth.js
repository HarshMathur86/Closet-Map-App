const admin = require('firebase-admin');

// Initialize Firebase Admin (simplified - works without service account for token verification)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
    });
}

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // For development, we'll extract user ID from a simpler approach
        // In production with proper Firebase Admin setup, use:
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // req.userId = decodedToken.uid;

        // Simplified: Accept userId header for development
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
