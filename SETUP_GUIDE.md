# ClosetMap Setup Guide

This guide will help you set up and run the ClosetMap application from scratch. The project is split into a **Node.js/Express Backend** and a **React Native (Expo) Mobile App**.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app on your physical mobile device (Android/iOS)

---

## 📂 Step 1: Environment Setup

### 1. Backend Configuration
Navigate to the `backend/` directory and create a `.env` file based on the implementation requirements.

```bash
cd backend
touch .env
```

**Required Environment Variables:**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase (Auth)
FIREBASE_PROJECT_ID=your_project_id
```

### 2. Mobile App Configuration
Update the API endpoint in `mobile/constants/Config.ts` to use your computer's local IP address so the physical device can communicate with the server.

```typescript
// mobile/constants/Config.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:5001/api' // e.g., http://192.168.1.7:5001/api
  : 'https://your-production-url.com/api';
```

---

## 🚀 Step 2: Running the Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Verify it's running:
   The terminal should display `🚀 Server running on port 5001` and `✅ Connected to MongoDB`.

---

## 📱 Step 3: Running the Mobile App

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npx expo start -c
   ```
   *(The `-c` flag ensures the bundler cache is cleared for a clean start)*
3. **Scan the QR Code**: Use the **Expo Go** app on Android or the **Camera app** on iOS to open the project.

---

## 🔧 Troubleshooting

### "Response 500" or Bundler Crashes
- Ensure `babel.config.js` exists in the `mobile/` directory with the `react-native-reanimated/plugin`.
- Restart the app with `npx expo start -c`.

### "Network Error" on mobile device
- Double-check that your phone and computer are on the **same Wi-Fi network**.
- Verify `Config.ts` contains your correct local IP address.
- Check that the backend server is running and port `5001` is allowed by your firewall.

### Firebase Auth Issues
- Ensure **Email/Password** authentication is enabled in your Firebase Console under the **Authentication** tab.