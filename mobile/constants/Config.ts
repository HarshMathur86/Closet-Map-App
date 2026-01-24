import {
    API_URL_DEV,
    API_URL_PROD,
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID
} from '@env';

// API Configuration
// Use your computer's IP address for development (localhost won't work on physical device)
export const API_BASE_URL = __DEV__
    ? API_URL_DEV
    : API_URL_PROD;

// Firebase Configuration
export const FIREBASE_CONFIG = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID
};

// App Info
export const APP_INFO = {
    name: 'ClosetMap',
    version: '1.0.0',
    bundleId: 'com.closetmap.clothsinentory'
};
