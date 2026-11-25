# Water & Electricity Tracker (EcoTracker)

A full-stack mobile application built with **React Native (Expo)**, **Node.js / Express**, and **PostgreSQL** to help users track daily water and electricity consumption, monitor progress against daily goals, and view 7-day usage analytics.

## Features

- **User Authentication:** Register, log in, and restore sessions securely using `bcryptjs` password hashing, JWT tokens, and `expo-secure-store`.
- **Water & Electricity Tracking:** Log daily water (Litres) and electricity (kWh) usage with PostgreSQL as the source of truth.
- **Daily Goals & Tips:** Set and persist daily water and electricity goals locally via `AsyncStorage`, with progress bars and dynamic saving tips.
- **Recent History & Weekly Analytics:** View chronological consumption history (India timezone `Asia/Kolkata`) and 7-day trend charts via `react-native-chart-kit`.
- **User Isolation & Validation:** All consumption routes are protected by JWT middleware, scoped to `req.user.userId`, and validated on both frontend and backend.

## Tech Stack

- **Frontend:** React Native, Expo (`~58`), Axios, Expo SecureStore, AsyncStorage, React Native Chart Kit
- **Backend:** Node.js, Express (`^5`), PostgreSQL (`pg`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `dotenv`

## Project Structure

```text
water-electricity-tracker/
├── App.js
├── app.json
├── index.js
├── package.json
├── src/
│   ├── context/
│   │   └── AuthContext.js
│   ├── screens/
│   │   ├── DashboardScreen.js
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   └── services/
│       └── api.js
└── backend/
    ├── .env.example
    ├── package.json
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        │   ├── db.js
        │   └── schema.sql
        ├── middleware/
        │   └── auth.js
        ├── routes/
        │   ├── auth.js
        │   ├── electricity.js
        │   └── water.js
        └── utils/
            └── validators.js
```

## Setup Instructions

### 1. Database Setup (PostgreSQL)

Create the database and apply the schema:

```bash
createdb water_electricity_tracker
psql -d water_electricity_tracker -f backend/src/config/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL credentials and a secure `JWT_SECRET`, then start the server:

```bash
npm run dev
```

The backend runs on port `5001` by default (`http://localhost:5001/api/health`).

### 3. Frontend Setup (Expo)

From the repository root:

```bash
npm install
npx expo start
```

> **Note for Expo Go on physical devices:** Update `API_BASE_URL` in `src/services/api.js` with your active Cloudflare Quick Tunnel URL or local network IP address so the mobile app can reach the backend.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Backend health check |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Get authenticated user profile |
| `POST` | `/api/water` | Bearer JWT | Add water consumption entry |
| `GET` | `/api/water/today` | Bearer JWT | Get today's total water usage (IST) |
| `GET` | `/api/water/history` | Bearer JWT | Get water usage history (newest first) |
| `POST` | `/api/electricity` | Bearer JWT | Add electricity consumption entry |
| `GET` | `/api/electricity/today` | Bearer JWT | Get today's total electricity usage (IST) |
| `GET` | `/api/electricity/history` | Bearer JWT | Get electricity usage history (newest first) |
