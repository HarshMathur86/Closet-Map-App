// API Configuration
// Use your computer's IP address for development (localhost won't work on physical device)
export const API_BASE_URL = __DEV__
    ? 'http://192.168.1.7:5001/api'
    : 'https://your-render-app.onrender.com/api'; // TODO: configure this for production

// Firebase Configuration
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAoVFNWFsh61yiJJXzRP3cNixQwEke-GHg",
    authDomain: "closet-map.firebaseapp.com",
    projectId: "closet-map",
    storageBucket: "closet-map.firebasestorage.app",
    messagingSenderId: "583115436686",
    appId: "1:583115436686:web:1be0c69123dc77bfe30fdf"
};

// App Info
export const APP_INFO = {
    name: 'ClosetMap',
    version: '1.0.0',
    bundleId: 'com.closetmap.clothsinentory'
};
