# Artha AI — Personal Finance Mobile App (Frontend)

Artha AI is an intelligent personal finance tracking mobile client built using React Native and Expo. It features a Safe-to-Spend engine, cash-flow forecasting, haptic feedback, a draggable AI coach orb, and a shared family safety net.

## 🛠️ Tech Stack
- **React Native + Expo** — Cross-platform mobile development
- **Zustand** — State management
- **React Native Reanimated** — Smooth animations
- **Expo Secure Store** — Secure token storage for JWT auth

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [Expo Go](https://expo.dev/client) app installed on your physical mobile device (iOS/Android)

### 2. Configure the Backend Connection
Before running, configure the API endpoint to point to your backend:
1. Open `services/api.ts`.
2. Locate `const BASE_URL = 'http://...';`.
3. Set it to your computer's local IP address or the live backend production URL:
   ```typescript
   const BASE_URL = 'http://10.215.168.109:3000'; // Replace with your local machine's IP address
   ```

*Note: The backend repository is located in the sibling folder `../artha-backend/`.*

### 3. Installation & Run
From the root of this folder, run:

```bash
# Install dependencies
npm install

# Start the Expo Go packager
npx expo start
```

Scan the generated QR code using the **Expo Go** app on Android or your camera app on iOS.

---

## 📁 Key Directories
- `app/` — Expo Router screen pages (Home, Forecast, Jars, Auth, settings, etc.)
- `components/` — Reusable UI elements (cards, text fields, headers)
- `store/` — Zustand stores (`useStore` for financial data, `useAuthStore` for tokens)
- `engine/` — Local ports of Safe-to-Spend, Danger Window, and Doom calculation engines (now computed on the backend server)
- `services/` — API fetch client layer

---

## 📄 License
Licensed under the MIT License. See [LICENSE](LICENSE) for details.
