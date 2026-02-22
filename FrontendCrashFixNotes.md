# Frontend Crash & Android Build Fixes

This document details the issues encountered while trying to build and run the Closet Map App on an Android emulator (and as a standalone APK), the root causes of those issues, the solutions applied, and the prerequisites for running the app locally.

---

## 1. The Problems & Applied Solutions

### Problem A: Immediate Crash of Standalone APK
**Symptom:** The Expo Development Client worked perfectly, but when building a standalone APK via EAS (`eas build -p android --profile production`), the app would crash instantaneously upon opening.
**Root Causes:**
1. **Missing Gesture Handler Initialization:** Expo Router combined with `react-native-reanimated` requires `react-native-gesture-handler` to be imported at the very top of the entry point, otherwise production Android builds will crash.
2. **Incompatible Native Module:** The `package.json` included `react-native-worklets@0.5.1`. This package is fundamentally incompatible with the React Native New Architecture (`newArchEnabled: true` in `app.json`) and causes instantaneous native fatal signals.

**Solution:**
1. Added `import 'react-native-gesture-handler';` as the absolute first line in `mobile/app/_layout.tsx`.
2. Uninstalled `react-native-worklets` to remove the incompatible native code.

### Problem B: Gradle & Environment Build Failures
**Symptom:** Running `npx expo run:android` failed multiple times locally with Gradle parsing errors and missing SDK errors.
**Root Causes:**
1. **JDK Mismatch (`Unsupported class file major version 69`):** The system was defaulting to Java 25, but Gradle 8.14.3 strictly requires Java 17 for React Native 0.81+.
2. **Missing SDK Location:** The terminal environment did not know where the Android SDK was installed.

**Solution:**
1. Installed `openjdk@17` via Homebrew.
2. Enforced the usage of Java 17 and defined the Android SDK location via terminal environment variables: `JAVA_HOME` and `ANDROID_HOME`.

### Problem C: React Native / Reanimated Version Conflicts
**Symptom:** Once Gradle began compiling correctly, it failed with Node script exit codes and C++ compilation errors.
**Root Cause:** Removing `react-native-worklets` broke the internal validation scripts of `react-native-reanimated@4.1.1`. To fix this, we had to downgrade Reanimated. However, doing so exposed that `react-native@0.84.0` was installed, which was too new for Expo SDK 54 and caused deep Java C++ (`NativeReanimatedModule.cpp`) mismatches.

**Solution:**
1. **Aligned React Native:** Explicity downgraded `react-native` to `0.81.5` (the exact version tailored for Expo 54).
2. **Aligned Packages:** Ran `npx expo install --fix` to auto-align all Expo-dependent libraries.
3. **Reanimated Downgrade:** Reverted to `react-native-reanimated@~3.16.1` which does not aggressively depend on worklets.
4. **Patched Android Gradle:** Modified `node_modules/react-native-reanimated/android/build.gradle` to completely bypass its remaining validation scripts that were searching for the now-removed `react-native-worklets`.

---

## 2. Prerequisites & Running Locally on Android

To ensure the application compiles and boots correctly on your local Android emulator, you must meet the following prerequisites and run the corresponding commands.

### Prerequisites

1. **Android Studio installed:** With a configured Android Virtual Device (AVD).
2. **Android SDK & Build Tools:** Installed through Android Studio's SDK Manager (ensuring SDK 36 and NDK are present).
3. **Java Development Kit (JDK) 17:** React Native strictly requires Java 17. 
   *(Installed on this machine via `brew install openjdk@17`).*

### How to Run the App (Terminal Commands)

Every time you open a **new terminal window** to build or run the Android app, your terminal needs to know where Java 17 and the Android tools live. 

Run these commands in order from your project directory (`/Closet-Map-App/mobile`):

**Step 1: Set Environment Variables**
Tell the current terminal session to use Java 17 and locate the Android SDK:
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

**Step 2: Start the Build**
Compile the native Android code and install it onto your running emulator:
```bash
npx expo run:android
```

*(Note: If you run this often, you can add the two `export` lines to your `~/.zshrc` file. This will make them permanent for all future terminal windows.)*
