# 🚀 Cart-Flow Server (Backend)

The backend of **Cart-Flow**, a full-stack marketplace application built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB**. It provides secure REST APIs for product management, seller operations, and seamless communication with the frontend.

## 🌐 Live API

**Base URL:** https://cart-flow-server.vercel.app

---

## ✨ Features

- 📦 RESTful API architecture
- 🛍️ Create new product listings
- 📋 Retrieve all products
- 🔍 Search products by keyword
- 🗂️ Filter products by category
- ✏️ Update existing products
- 🗑️ Delete products
- 👤 Manage seller-specific products
- ⚡ Built with TypeScript for better type safety
- 🌍 MongoDB integration using Mongoose
- 🚀 Deployed on Vercel

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- CORS
- Dotenv
- Vercel

---

## 📁 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get a single product |
| POST | `/products` | Create a new product |
| PATCH | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |

> Add any additional endpoints here if your API includes authentication, seller management, categories, etc.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (v18 or later)
- MongoDB
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/cart-flow-server.git
```

Navigate to the project directory:

```bash
cd cart-flow-server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=YOUR_MONGODB_CONNECTION_STRING
```

Start the development server:

```bash
npm run dev
```

The server will run on:

```
http://localhost:5000
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── controllers/
│   ├── interfaces/
│   ├── models/
│   ├── routes/
│   └── services/
├── config/
├── app.ts
└── server.ts
```

---

## 📦 Build for Production

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

---

## 🔗 Frontend

Frontend Live: https://cart-flow-henna.vercel.app

> Add your frontend repository link here.

---

## 👨‍💻 Author

**Muhammed Sayem**

- GitHub: https://github.com/Msayeem
- LinkedIn: https://www.linkedin.com/in/sayem-dev

---

## 📄 License

This project is licensed under the MIT License.