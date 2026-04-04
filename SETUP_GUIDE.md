# ClosetMap Setup Guide

This guide will help you set up and run the ClosetMap application from scratch. The project is split into a **Node.js/Express Backend** and a **React Native (Expo) Mobile App**.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

### General
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app on your physical mobile device (Android/iOS)
- [EAS CLI](https://docs.expo.dev/eas/) — install globally: `npm install -g eas-cli`

### For Local Android Builds (Optional)
- **Android Studio** with a configured Android Virtual Device (AVD)
- **Android SDK & Build Tools** (SDK 36 and NDK via Android Studio's SDK Manager)
- **Java Development Kit (JDK) 17** — React Native 0.81+ strictly requires Java 17
  ```bash
  # Install on macOS via Homebrew
  brew install openjdk@17
  ```

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

## 📱 Step 3: Running the Mobile App (Development)

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

## 📦 Step 4: Building with EAS (Expo Application Services)

EAS Build is used to produce standalone APKs and app bundles for distribution. All builds run in the cloud — no local Android SDK required.

### 4.1 Login to EAS
```bash
eas login
```

### 4.2 Build Commands

#### Development Build (for testing with Expo Dev Client)
```bash
cd mobile
eas build -p android --profile development
```

#### Preview Build (internal testing APK)
```bash
cd mobile
eas build -p android --profile preview
```

#### Production Build (standalone APK for release)
```bash
cd mobile
eas build -p android --profile production
```

#### Build for iOS (requires Apple Developer account)
```bash
cd mobile
eas build -p ios --profile production
```

### 4.3 Download the APK
Once the build finishes, EAS will provide a download URL in the terminal. You can also find all builds at:
```
https://expo.dev/accounts/<your-username>/projects/closetmap/builds
```

### 4.4 Submit to App Store / Play Store (optional)
```bash
eas submit -p android
eas submit -p ios
```

---

## 🔨 Step 5: Local Android Build (Without EAS)

If you need to compile and run natively on a local emulator or device (useful for debugging native crashes), follow these steps.

### 5.1 Set Environment Variables
Every time you open a **new terminal window**, set these before building:
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export ANDROID_HOME="$HOME/Library/Android/sdk"
```
> **Tip:** Add the two `export` lines to your `~/.zshrc` to make them permanent.

### 5.2 Run on Emulator / Connected Device
```bash
cd mobile
npx expo run:android
# or
npm run android
```

### 5.3 Regenerate Native Code (Clean Prebuild)
If native code is stale or you've changed `app.json` / plugins, regenerate:
```bash
cd mobile
npx expo prebuild --platform android --clean
npx expo run:android
```

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

### Production APK Crashes Immediately
This is typically caused by missing native module initialisation:
1. Ensure `import 'react-native-gesture-handler';` is the **very first import** in `mobile/app/_layout.tsx`.
2. Verify `react-native-worklets` is **not** installed — it is incompatible with `newArchEnabled: true`.
3. Run `npx expo install --fix` to align all Expo-dependent library versions.

### Gradle / JDK Build Failures (`Unsupported class file major version 69`)
- This means the system is using a JDK version other than 17. Ensure `JAVA_HOME` points to JDK 17:
  ```bash
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
  java -version   # should show openjdk 17.x
  ```

### React Native / Reanimated Version Conflicts
- Ensure `react-native` is at `0.81.5` (the version aligned with Expo SDK 54).
- Run `npx expo install --fix` to auto-correct mismatched package versions.
- If Reanimated validation scripts fail, ensure you are on `react-native-reanimated@~3.16.1` or the version recommended by `npx expo install --fix`.

### Stale Code — Changes Not Reflecting
Perform a deep clean:
```bash
cd mobile
rm -rf .expo node_modules/.cache/metro
npx expo start -c
```
On your device: force-close Expo Go → clear its cache in Android Settings → re-scan QR code.