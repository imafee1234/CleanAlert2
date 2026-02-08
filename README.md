# CleanAlert 🚨🌱

CleanAlert is a mobile-first environmental reporting platform that allows users to report environmental issues (illegal dumping, pollution, hazards, etc.) with photos and location data. Reports are sent to a backend API and managed through an admin dashboard.

This repository contains **both the mobile app (Expo / React Native)** and the **backend server (Node.js / Express)**.

---

## 📁 Project Structure

```
CleanAlert/
│
├── mobile-app/              # Expo (React Native) mobile application
│   ├── app/                 # App routes (Expo Router)
│   │   ├── (auth)/           # Login & Register screens
│   │   ├── (tabs)/           # Home, Report, Profile tabs
│   │   └── index.tsx         # Welcome / entry screen
│   │
│   ├── components/          # Reusable UI components
│   ├── services/            # API calls (api.js)
│   ├── assets/              # Images, icons, fonts
│   ├── app.json             # Expo configuration
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # TypeScript config
│
├── backend/                 # Node.js + Express backend API
│   ├── controllers/         # Request logic
│   ├── routes/              # API routes
│   ├── models/              # Database models
│   ├── uploads/             # Uploaded images
│   ├── server.js             # App entry point
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
│
├── .gitignore
├── README.md
└── package-lock.json
```

---

## 🚀 Tech Stack

### Mobile App

* Expo (React Native)
* Expo Router
* TypeScript
* Expo Image Picker
* Expo Location

### Backend

* Node.js
* Express.js
* Multer (image uploads)
* MongoDB / MySQL (depending on setup)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/cleanalert.git
cd CleanAlert
```

---

## 📱 Mobile App Setup (Expo)

### Install dependencies

```bash
cd mobile-app
npm install
```

### Start Expo (Recommended)

```bash
npx expo start
```

* Install **Expo Go** on your Android phone
* Ensure phone & PC are on the **same Wi‑Fi network**
* Scan the QR code from the terminal or browser

---

### API Configuration

Edit:

```
mobile-app/services/api.js
```

Set your local IP address:

```js
export const BASE_URL = "http://YOUR_PC_IP:5000";
```

Example:

```js
export const BASE_URL = "http://192.168.135.236:5000";
```

---

## 🖥 Backend Setup

### Install dependencies

```bash
cd backend
npm install
```

### Create `.env` file

```env
PORT=5000
```

### Start server

```bash
npm start
```

Server runs on:

```
http://localhost:5000
```

For mobile testing, use your **PC IP address**, not `localhost`.

---

## 🧪 API Endpoints

### Authentication

* `POST /auth/register`
* `POST /auth/login`

### Reports

* `POST /api/reports` → Create report (multipart/form-data)
* `GET /api/reports` → Fetch all reports

---

## 📸 Reporting Flow (Mobile)

1. User enters title & description
2. User selects image (optional)
3. User captures GPS location
4. Report is submitted to backend
5. Image is saved in `/uploads`
6. Admin can review reports

---

## 👨‍💼 Admin Dashboard (Planned / MVP)

* View all reports
* View report image & location
* Change report status (Pending / Resolved)
* Basic authentication

---

## 🧠 Common Issues

### ❌ Server not reachable

* Ensure backend is running
* Ensure correct IP address in `api.js`
* Phone & PC must be on same Wi‑Fi

### ❌ Image upload fails

* Backend must use `multer`
* Ensure `Content-Type: multipart/form-data`

---

## 📌 Git Workflow

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

---

## 📄 License

This project is for educational and community impact purposes.

---

## 🙌 Author

**Favour Imafidor (Ositofime)**
Computer Software Engineering Student
CleanAlert Project

---

🌱 *Together, we keep our environment clean.*
