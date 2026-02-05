<div align="center">
  <h1>⚡ Campus Canteen Food Hub ⚡</h1>
  <p>
    <img src="https://img.shields.io/badge/Angular-v17+-dd0031?style=for-the-badge&logo=angular" alt="Angular">
    <img src="https://img.shields.io/badge/TypeScript-v5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Node.js-v18-green?style=for-the-badge&logo=node.js" alt="Node.js">
    <img src="https://img.shields.io/badge/MongoDB-v6.0-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  </p>
  <p><i>A unified, type-safe digital ecosystem for campus dining.</i></p>
</div>

---

## 📖 Project Overview

**Campus Canteen** is a full-stack web application designed to digitize university dining. It streamlines the ordering process, manages transactions via a secure digital wallet, and provides a robust admin interface for canteen staff.

### Key Features
*   **Digital Wallet**: Rechargeable student wallets for cashless transactions.
*   **Smart Notifications**: Real-time updates for order status and balance changes.
*   **Role-Based Access**: Distinct portals for Students (User) and Staff (Admin).
*   **Optimized Performance**: Built with Angular Signals and Standalone components for high speed.

---

## � Quick Start (One-Command Run)

We have simplified the setup. You can run the entire ecosystem (Server + User Portal + Admin Portal) with a single command.

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas URI (or local MongoDB)

### Setup & Run
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Sowndhar-2005/TS-MEAN-Stack.git
    cd TS-MEAN-Stack
    ```

2.  **Run Everything**:
    This command installs all dependencies for backend/frontend and starts all three servers concurrently.
    ```bash
    npm run start-all
    ```
    *(Note: If `start-all` is not configured in your specific root package.json, please follow the manual steps below)*

### Manual Commands
*   **Server**: `cd server && npm run dev` (Port: 3000)
*   **User App**: `cd client-user && npm start` (Port: 4200)
*   **Admin App**: `cd client-admin && npm start` (Port: 4201)

> **Login Credentials (Demo)**:
> *   **Admin**: `admin@college.edu` / `admin123`
> *   **User**: `alice@college.edu` / `password123`

---

## 🔧 Technical Configuration Guide

This project is built using a robust TypeScript environment. Follow these steps to set up the backend:

1.  **Initialization**:
    ```bash
    npm init -y
    ```

2.  **Dependencies**:
    Install the necessary packages and dev-dependencies:
    ```bash
    npm install express mongoose dotenv cors helmet morgan
    npm install --save-dev typescript @types/node @types/express @types/cors @types/morgan ts-node nodemon
    ```

3.  **TypeScript Configuration**:
    Generate `tsconfig.json`:
    ```bash
    npx tsc --init
    ```
    Ensure your `tsconfig.json` targets ES2020 or later and has `outDir` set to `./dist`.

4.  **Scripts**:
    Add the following to your `package.json` scripts:
    ```json
    "scripts": {
      "start": "node dist/server.js",
      "dev": "nodemon --exec ts-node src/server.ts",
      "build": "tsc"
    }
    ```

### 📂 Folder Structure Breakdown

The project follows a standard MEAN stack architecture with a clear separation of concerns.

#### **Frontend**
The frontend is divided into two distinct Angular applications:
*   **`client-user/` (Student Portal)**: The main interface for students to browse menus, add items to cart, and track orders. (Default Port: 4200)
*   **`client-admin/` (Staff Portal)**: The administrative dashboard for canteen staff to manage menu items, view active orders, and update order statuses. (Port: 4201)

#### **Backend**
The `server/src/` directory is organized using the MVC pattern:
*   **`controllers/`**: Handles incoming requests and business logic (e.g., `orderController.ts`).
*   **`models/`**: Mongoose schemas and interfaces defining data structure (e.g., `User.ts`).
*   **`routes/`**: Express route definitions mapping URLs to controllers.
*   **`middleware/`**: Custom middleware for authentication (`auth.ts`) and error handling.
*   **`utils/`**: Helper functions for logic (`logicHelpers.ts`).
*   **`seed/`**: Database seeding scripts.

---

## 📱 Screen Guide

### User Portal
1.  **Home (Menu)**: Browse food items. Search by name or tag. Add to cart.
2.  **Cart**: Review items. Place order using Wallet. *(Note: UPI is currently disabled)*.
3.  **Active Orders**: See real-time progress of your meal.
4.  **Profile**:
    *   **Activity History**: Comprehensive log of Orders and Wallet Credits/Debits.
    *   **Stats**: Total spent and orders placed.
5.  **Notifications**: Click the bell icon in the navbar to see updates about orders or balance.

### Admin Portal
1.  **Dashboard**: High-level metrics of canteen performance.
2.  **User Management**: Search for students. Click actions to **Add Funds** or **Penalty (Reduce Funds)**.
3.  **Order Management**: View all incoming orders and update their status (e.g., mark as Ready/Completed).

---

## 📡 API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Authenticate user/admin. Returns JWT & Profile. |
| **GET** | `/api/auth/me` | Fetch detailed profile, wallet balance, and notifications. |
| **POST** | `/api/orders` | Place a new order. Requires `{ paymentMethod: 'wallet', items: [...] }`. |
| **GET** | `/api/orders/my` | Fetch order history for logged-in user. |
| **POST** | `/api/admin/users/:id/wallet` | Admin only. Add/Reduce wallet balance. |
| **PUT** | `/api/auth/notifications/read` | Mark notifications as read. |

---

## � Future Improvements (Roadmap)

To further enhance the Campus Canteen experience, the following features are planned:
1.  **UPI Integration**: Fully implement real UPI payment gateway for balance recharge.
2.  **Collaborative Ordering**: "Invite Friend" feature to share a cart and split the bill.
3.  **Enhanced Inventory**: Admin system to manage "Food Quantity" (Daily Stock) dynamically.
4.  **Menu System 2.0**: Advanced scheduling (Breakfast/Lunch/Dinner specific menus).
5.  **Profile Avatars**: Allow users to upload custom profile pictures.

---

<div align="center">
  <small>© 2026 Campus Canteen Project</small>
</div>
