# Artha AI - Project Status & Handoff

This document contains all the recent bug fixes and the current state of the application. Please provide this to the new AI to instantly bring it up to speed.

## 1. The Core Network Issue (Current Problem)
- **The Bug:** Expo Go on the physical phone fails to download the bundle with `Failed to download remote update`.
- **The Cause:** The Windows PC is running a virtual network adapter for WSL (`172.31.240.1`). Expo's bundler was incorrectly broadcasting the QR code on this virtual network instead of the real Wi-Fi network (`192.168.1.115`).
- **The Fix:** The bundler must be started by forcing the correct hostname in PowerShell:
  ```powershell
  $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.115"; npx expo start -c
  ```
- *Note:* Tunneling (`--tunnel`) was attempted but blocked by the user's ISP/Firewall (`remote gone away` ngrok error).

## 2. Recent Code Bugs Fixed
We fixed three critical runtime crashes that were preventing the app from launching on Android:

1. **Font Loading Crash (`App.tsx`):**
   - **Issue:** The app was getting stuck buffering, and if custom fonts failed to load (due to network timeout), it bypassed the loading screen and attempted to render the app, causing an instant native red screen crash.
   - **Fix:** We separated the font loading `if` statements so that if a `fontError` occurs, the app safely displays a text error on-screen instead of crashing.

2. **Gesture Handler Crash (`App.tsx`):**
   - **Issue:** The app would instantly crash upon opening on Android because `react-native-gesture-handler` was installed but not initialized.
   - **Fix:** We added `import 'react-native-gesture-handler';` to the absolute top (line 1) of `App.tsx`.

3. **Metro Bundler Crash (`babel.config.js`):**
   - **Issue:** Metro bundler was crashing with `Cannot read properties of undefined (reading 'transformFile')`.
   - **Fix:** The project uses `react-native-reanimated` v4.x, which completely removed the need for the babel plugin. We removed the old Reanimated plugin from `babel.config.js`, which fixed the Metro build.

## 3. How to Run the App
If you are starting fresh, open PowerShell and run:

```powershell
# 1. Clear any broken cache and ensure clean dependencies
npm install

# 2. Force Expo to use the correct Wi-Fi IP and start the bundler
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.115"
npx expo start -c
```
