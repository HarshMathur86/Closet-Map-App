import {
    EXPO_PUBLIC_API_URL_DEV,
    EXPO_PUBLIC_API_URL_PROD,
    EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID
} from '@env';

// API Configuration
// Use your computer's IP address for development (localhost won't work on physical device)
export const API_BASE_URL = __DEV__
    ? EXPO_PUBLIC_API_URL_DEV
    : EXPO_PUBLIC_API_URL_PROD;

// Firebase Configuration
export const FIREBASE_CONFIG = {
    apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: EXPO_PUBLIC_FIREBASE_APP_ID
};

// App Info
export const APP_INFO = {
    name: 'ClosetMap',
    version: '1.4.0',
    bundleId: 'com.closetmap.clothsinentory'
};
