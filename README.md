# 💬 Huddle - MEC Student Community

**Huddle** is a real-time collaboration and social platform designed exclusively for **MEC students**. It connects the campus through a central hub where students can chat, create activities, and stay updated on what's happening live on campus.

## ✨ Key Features

*   **🔐 Exclusive Access:** Secure Google Login restricted strictly to `@mec.ac.in` email addresses.
*   **🎨 Glassmorphism UI:** A premium, dark-themed design using modern CSS transparency and blur effects.
*   **📡 Real-Time Chat:** Instant messaging with global chat rooms, supporting **Emojis** and **Giphy** (GIFs).
*   **🚀 Activity Hub:**
    *   Create campus activities (Study groups, Hackathons, Sports).
    *   View live feed of ongoing and upcoming events.
    *   See details like Location, End Time, and Host.
*   **📱 Fully Responsive:** Works seamlessly on Desktop and Mobile.

## 🛠️ Tech Stack

*   **Frontend Library:** [React.js](https://reactjs.org/) (Vite)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore)
*   **Routing:** React Router DOM
*   **Icons & Media:** Heroicons, Emoji Picker React, Giphy API

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
*   Node.js (v16 or higher)
*   npm or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/huddle.git
cd huddle
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory. You will need API keys from Firebase and Giphy.

```env
# Firebase Configuration
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id

# Giphy Configuration (For Chat)
VITE_GIPHY_KEY=your_giphy_api_key
```

### 5. Run the Application
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔥 Firebase Setup Guide

To make the app work, you need to set up a Firebase Project:

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Authentication:** Enable **Google Sign-In**.
4.  **Firestore Database:** Create a database in **Production Mode**.
5.  **Firestore Rules:** Update your rules to allow authenticated users to read/write:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```

---

## 📂 Project Structure

```bash
src/
├── components/          # Reusable UI components
│   ├── ActivityCard.jsx # Displays individual event details
│   ├── CreateActivityModal.jsx # Form popup to add new events
│   └── Loading.jsx      # Loading spinner
├── pages/               # Main Application Pages
│   ├── Login.jsx        # Google Auth Screen
│   ├── Dashboard.jsx    # Main Hub (Feeds & Actions)
│   └── Chat.jsx         # Real-time Chat Room
├── utils/
│   └── ProtectedRoute.jsx # Handles security redirects
├── firebase.js          # Firebase configuration & initialization
├── App.jsx              # Routing logic
└── index.css            # Global styles (Tailwind + Glass effects)
```

## 🤝 Contributing

Contributions are welcome!
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Made with 💙 for MEC Students**
