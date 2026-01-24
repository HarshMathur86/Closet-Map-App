# ClosetMap - Clothes Inventory & Bag Tracking App

A cloud-based mobile application for tracking clothes stored across multiple bags using barcode-based identification, image-based search, and smart filtering.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | Firebase Authentication |
| Image Storage | Cloudinary |

## Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on `http://localhost:5001`.
> **Note**: For mobile testing, ensure your phone and computer are on the same Wi-Fi. The mobile app is configured to connect to `192.168.1.7:5001`. If your IP changes, update `mobile/constants/Config.ts`.

### 2. Start Mobile App
```bash
cd mobile
npm install
npx expo start -c
```
Scan the QR code with **Expo Go** on your Android phone.
> **Note**: The `-c` flag clears the bundler cache, which resolves many "Response 500" errors.

## Project Structure

```
├── backend/                # Node.js Express API
│   ├── server.js           # Entry point
│   ├── src/models/         # MongoDB schemas
│   ├── src/routes/         # API endpoints
│   └── .env                # Credentials
│
├── mobile/                 # React Native App
│   ├── app/                # Expo Router screens
│   ├── components/         # Reusable UI components
│   ├── babel.config.js     # Babel config (vital for Reanimated)
│   └── constants/Config.ts # API Configuration
```

## API Documentation

All API requests must include the following headers for authentication:

```http
Authorization: Bearer <firebase_id_token>
X-User-Id: <user_uid>
Content-Type: application/json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bags` | List user's bags |
| POST | `/api/bags` | Create bag |
| GET | `/api/clothes` | List clothes (with filters) |
| POST | `/api/clothes` | Add cloth with image |
| GET | `/api/clothes/scan/:barcode` | Get clothes by bag barcode |
| GET | `/api/export/barcodes` | Download PDF of barcodes |

## Features

- ✅ Email authentication
- ✅ Create/manage bags with auto-generated barcodes
- ✅ Add clothes with image upload
- ✅ Search and filter clothes
- ✅ Barcode scanner for bags
- ✅ Dark/Light theme
- ✅ Export barcode PDF

### Bags API

#### 1. POST /api/bags
Create a new bag.

**Request Body:**
```json
{
  "name": "Winter Clothes"
}
```

**Response:**
```json
{
  "_id": "65b...",
  "bagId": "B1",
  "name": "Winter Clothes",
  "barcodeValue": "BAG-ABCD1234",
  "clothCount": 0,
  "createdAt": "2026-01-24T12:00:00.000Z"
}
```

#### 2. GET /api/bags
List all bags.

**Response:**
```json
[
  {
    "bagId": "B1",
    "name": "Winter Clothes",
    "clothCount": 5
  },
  {
    "bagId": "B2",
    "name": "Summer Clothes",
    "clothCount": 12
  }
]
```

### Clothes API

#### 1. POST /api/clothes
Add a new cloth item.

**Request Body:**
```json
{
  "name": "Blue Denim Jacket",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZ...",
  "color": "#3B82F6",
  "owner": "Harsh",
  "category": "Jackets",
  "containerBagId": "B1",
  "notes": "Bought in 2024"
}
```

**Response:**
```json
{
  "clothId": "C-XYZ9876",
  "name": "Blue Denim Jacket",
  "imageUrl": "https://res.cloudinary.com/...",
  "containerBagId": "B1",
  "bagName": "Winter Clothes",
  "favorite": false
}
```

#### 2. GET /api/clothes
List clothes with filters.

**Query Parameters:**
- `sortBy`: `name` | `createdAt` | `color`
- `sortOrder`: `asc` | `desc`
- `search`: `blue` (matches name, color, owner, category user-friendly)
- `bagId`: `B1` (filter by bag)
- `favorite`: `true` (only favorites)

**Example URL:**
`GET /api/clothes?search=jacket&favorite=true&sortBy=createdAt`

### Export API

#### 1. GET /api/export/barcodes
Download PDF with barcodes for all bags.

**Response:** Binary PDF file.

## Troubleshooting

### "The development server returned response 500"
This is usually a Metro bundler cache issue or configuration error.
**Fix:**
1. Ensure `babel.config.js` exists in `mobile/` and includes `react-native-reanimated/plugin`.
2. Clear cache: `npx expo start -c`.

### "Network Error" in Mobile App
The mobile app cannot reach the backend on `localhost`.
**Fix:**
1. Find your computer's IP: `ipconfig getifaddr en0`.
2. Update `mobile/constants/Config.ts` with the new IP.
3. Restart backend: `npm run dev`.
4. Reload mobile app.
