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

## 🔧 Technical Configuration

### Backend Structure (`server/src/`)
The backend follows the **MVC (Model-View-Controller)** pattern for scalability.
*   **`controllers/`**: Business logic.
    *   `authController.ts`: Login, Registration, Profile management.
    *   `orderController.ts`: Order placement, fetching history.
    *   `adminController.ts`: Wallet management, Admin dashboard stats.
*   **`models/`**: Mongoose Schemas (TypeScript Interfaces).
    *   `User.ts`: Stores profile, wallet balance, and notifications.
    *   `Order.ts`: Tracks items, total cost, and cooking status.
*   **`routes/`**: API Endpoint definitions.
*   **`middleware/`**: `auth.ts` for JWT verification.

### Frontend Structure
Two separate Angular applications sharing a common design philosophy.

#### 1. Client User (`client-user/`)
*   **`src/app/pages/`**:
    *   **Home/Menu**: Filter food by category/type (Veg/Non-Veg).
    *   **Cart**: Manage selected items and checkout.
    *   **Orders**: Live tracking of current order status (Cooking/Ready).
    *   **Profile**: View usage stats, wallet transactions, and history.
*   **`shared/top-navbar/`**: Contains the notification bell logic and wallet balance display.

#### 2. Client Admin (`client-admin/`)
*   **`src/app/pages/`**:
    *   **Overview**: Dashboard with total orders, revenue, and active user counts.
    *   **Users**: List of all students; allows adding/reducing wallet balance.
    *   **Change Requests**: (Future) Manage profile update requests.

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
