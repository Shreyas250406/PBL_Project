# 🎓 Campus Lost & Found

A full-stack web application for college campuses that helps students report lost items, report found items, and **automatically matches them** using a smart scoring algorithm.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ✨ Features

### 🔐 Authentication
- JWT-based login & registration
- Password hashing with bcrypt
- Role-based access (student / admin)
- Protected routes

### 📦 Item Management
- Report lost items with images, categories, colors, descriptions
- Report found items with the same rich detail
- Image upload with drag-and-drop preview
- Search, filter, and sort items

### 🧠 Smart Matching Algorithm
Automatically compares lost and found items using a scoring system:

| Attribute | Max Points |
|-----------|-----------|
| Name similarity | 40 |
| Category match | 20 |
| Color match | 20 |
| Description keywords | 10 |
| Location proximity | 10 |

Items scoring **>60%** are flagged as "Possible Matches" with notifications.

### 🔔 Notifications
- In-app notifications for:
  - New potential matches found
  - Someone claims your item
  - Claim approved / rejected
- Real-time unread badge count

### ✋ Claim System
- Users can claim items with verification messages
- Admins can approve or reject claims
- Notifications sent on status changes

### 🛡️ Admin Panel
- Dashboard with stats (total lost, found, matched, claims)
- Manage all items, claims, and matches
- Delete fake reports
- Approve/reject claims

### 🎨 Modern UI
- Dark theme with glassmorphism
- Smooth animations and micro-interactions
- Fully responsive (mobile, tablet, desktop)
- Staggered card animations

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Images | Local storage (Multer) |
| Icons | Lucide React |

---

## 📂 Project Structure

```
lost-found-app/
├── backend/
│   ├── controllers/          # Route handlers
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── matchController.js
│   │   ├── claimController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Match.js
│   │   ├── Claim.js
│   │   └── Notification.js
│   ├── routes/               # API routes
│   ├── middleware/            # Auth & upload middleware
│   ├── utils/                # Matching algorithm
│   ├── uploads/              # Image storage
│   ├── server.js             # Entry point
│   └── .env                  # Environment variables
├── frontend/
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── ItemCard.jsx
│       │   ├── SearchBar.jsx
│       │   ├── MatchList.jsx
│       │   └── ImageUploader.jsx
│       ├── pages/            # Page components
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── ReportLost.jsx
│       │   ├── ReportFound.jsx
│       │   ├── LostItems.jsx
│       │   ├── FoundItems.jsx
│       │   ├── ItemDetail.jsx
│       │   └── AdminPanel.jsx
│       ├── context/          # Auth context
│       ├── services/         # API client
│       ├── App.jsx
│       └── main.jsx
└── package.json              # Root scripts
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (or a MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Install all dependencies
cd lost-found-app
npm run install:all
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lost-found-campus
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

### 4. Open the App

Visit **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/items/lost` | Report lost item |
| POST | `/api/items/found` | Report found item |
| GET | `/api/items/lost` | List lost items (with filters) |
| GET | `/api/items/found` | List found items (with filters) |
| GET | `/api/items/:id` | Get item details |
| GET | `/api/items/my/items` | Get user's items |
| DELETE | `/api/items/:id` | Delete item |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Get user's matches |
| GET | `/api/matches/:itemId` | Get matches for an item |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claims` | Create a claim |
| GET | `/api/claims/my` | Get user's claims |
| PATCH | `/api/claims/:id` | Approve/reject (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/items` | All items |
| DELETE | `/api/admin/items/:id` | Delete item |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/matches` | All matches |

---

## 🧪 Creating an Admin User

Register a regular user, then update their role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@university.edu" },
  { $set: { role: "admin" } }
)
```

---

## 📄 License

MIT License — feel free to use this for your projects!
