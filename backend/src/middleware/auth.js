const admin = require('firebase-admin');

// Initialize Firebase Admin with service account credentials
if (!admin.apps.length) {
    let serviceAccount;

    // In production (Render), use environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log('✅ Using Firebase service account from environment variable');
        } catch (error) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
            throw error;
        }
    } else {
        // In development, use local file
        try {
            serviceAccount = require('../config/ServiceAccountKey.json');
            console.log('✅ Using Firebase service account from local file');
        } catch (error) {
            console.error('❌ Failed to load ServiceAccountKey.json:', error.message);
            throw error;
        }
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
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

        // Simplified: Accept userId header for development only
        // const userId = req.headers['x-user-id'];
        // if (!userId) {
        //     return res.status(401).json({ error: 'User ID required' });
        // }
        // req.userId = userId;

        //Production verification
        console.log("Token: " + token)
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.userId = decodedToken.uid;
        console.log("Decoded token:", decodedToken);


        next();
    } catch (error) {
        console.error('Auth error:', error.message);

        // DEVELOPMENT
        // res.status(401).json({ error: 'Invalid token' });
        // const userId = req.headers['x-user-id'];
        // if (!userId) {
        //     return res.status(401).json({ error: 'User ID required' });
        // }
        // req.userId = userId;

        //PRODUCTION
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.code === 'auth/argument-error') {
            return res.status(401).json({ error: 'Invalid token format' });
        } else if (error.code === 'auth/id-token-revoked') {
            return res.status(401).json({ error: 'Token has been revoked' });
        }
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
