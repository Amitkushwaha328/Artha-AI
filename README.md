<div align="center">
  <img src="C:\Users\Asus\OneDrive\Desktop\Work house\Project\Artha AI\Gemini_Generated_Image_8zoip58zoip58zoi (1).png" alt="Artha AI Banner" width="100%"/>

  <br/>
  <br/>

  [![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-brightgreen?style=for-the-badge&logo=expo)](https://expo.dev)
  [![Made with](https://img.shields.io/badge/Made%20with-React%20Native-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
  [![Language](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)
  [![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20PostgreSQL-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)

  <br/>

  <h3>Your intelligent money companion — know exactly what you can spend, every single day.</h3>

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 💸 **Safe-to-Spend Engine** | Calculates your spendable budget in real-time, factoring in upcoming bills, safety buffer, and savings targets |
| 📉 **30-Day Danger Window** | Forecasts your cash flow and highlights dangerous low-balance days before they happen |
| 🚨 **Doom Spending Detector** | Catches impulsive spending patterns in the last 48 hours before they spiral |
| 🤖 **AI Financial Coach** | Conversational AI powered by Gemini that answers your personal finance questions |
| 👨‍👩‍👧 **Family Safety Net** | Track shared expenses with family members and set individual monthly limits |
| 🫙 **Savings Jars** | Visual goal-based saving system with auto-save targets and progress tracking |
| 🧾 **Gig Invoice Tracker** | For freelancers — manage clients, track due invoices and payment status |
| 🔐 **Secure Auth** | JWT-based authentication with encrypted token storage using Expo Secure Store |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Mobile App** | React Native + Expo Router |
| **Language** | TypeScript |
| **State Management** | Zustand |
| **Animations** | React Native Reanimated |
| **Auth & Storage** | Expo Secure Store + JWT |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL (Supabase) |

</div>

---

## 📱 Screens

> Home · Transactions · Bills · Savings Jars · Gig · AI Coach · Family · Forecast · Settings

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- [Expo Go](https://expo.dev/client) app on your phone (iOS or Android)
- A running instance of the [Artha AI Backend](../artha-backend/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Amitkushwaha328/Artha-AI.git
cd Artha-AI

# 2. Install dependencies
npm install

# 3. Configure the backend URL
# Open services/api.ts and set your backend URL:
# const BASE_URL = 'http://YOUR_MACHINE_IP:3000';

# 4. Start the app
npx expo start
```

Scan the QR code with **Expo Go** on Android or the **Camera app** on iOS.

---

## 📁 Project Structure

```
artha/
├── app/            # Expo Router screens (Home, Auth, Forecast, Jars, etc.)
├── components/     # Reusable UI components
├── engine/         # Financial calculation engines (STS, Danger Window, Doom)
├── services/       # API client layer (connects to backend)
├── store/          # Zustand state stores (auth, financial data)
├── ai/             # Gemini AI coach integration
├── assets/         # Images, icons, fonts
└── utils/          # Helper utilities (notifications, formatting, etc.)
```

---

## 🔗 Related

- 🖥️ **Backend Repository**: [artha-backend](../artha-backend/) — Node.js + Express + PostgreSQL

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Amitkushwaha328">Amit Kushwaha</a></sub>
</div>
