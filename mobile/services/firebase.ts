import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    initializeAuth,
    // @ts-ignore
    getReactNativePersistence,
    Auth
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '../constants/Config';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
} catch (e) {
    // if auth is already initialized use getAuth
    auth = getAuth(app);
}

export { auth };

// Auth functions
export const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const signOut = async () => {
    await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
    return auth.currentUser;
};

export const getIdToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
};
