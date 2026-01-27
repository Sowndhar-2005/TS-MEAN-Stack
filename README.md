<div align="center">
  <h1>⚡ Campus Canteen Food Hub ⚡</h1>
  <p>
    <img src="https://img.shields.io/badge/Angular-v21-dd0031?style=for-the-badge&logo=angular" alt="Angular">
    <img src="https://img.shields.io/badge/TypeScript-v5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Node.js-v18-green?style=for-the-badge&logo=node.js" alt="Node.js">
    <img src="https://img.shields.io/badge/MongoDB-v6.0-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  </p>
</div>

---

### 🎯 Project Motive

The primary motive behind the Campus Canteen Food Hub is to digitize and simplify the daily dining experience of university students through a unified, type-safe ecosystem. By leveraging a Full-Stack TypeScript (MEAN) architecture, the project aims to solve three core campus challenges:

1.  **Efficiency**: Eliminating physical queues with a digital menu and real-time cooking tracking.
2.  **Identity-Based Logic**: Automatically tailoring the experience for Hostellers vs. Day Scholars using smart registration detection.
3.  **Collaborative Dining**: Introducing a unique Shared Cart system that allows students to coordinate group orders and manage split-bill payments seamlessly.

---

### 🔧 Technical Configuration Guide

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

---

### 📂 Folder Structure Breakdown

The project follows a standard MEAN stack architecture with a clear separation of concerns.

#### **Frontend**
The frontend is divided into two distinct Angular applications:
*   **`client-user/` (Student Portal)**: The main interface for students to browse menus, add items to cart, and track orders. (Default Port: 4200)
*   **`client-admin/` (Staff Portal)**: The administrative dashboard for canteen staff to manage menu items, view active orders, and update order statuses. (Port: 4201)

#### **Backend**
The `server/src/` directory is organized using the MVC pattern:
*   **`controllers/`**: Handles incoming requests and business logic (e.g., `orderController.ts`, `authController.ts`).
*   **`models/`**: Mongoose schemas and interfaces defining data structure (e.g., `User.ts`, `Food.ts`).
*   **`routes/`**: Express route definitions mapping URLs to controllers.
*   **`middleware/`**: Custom middleware for authentication (`auth.ts`) and error handling.
*   **`utils/`**: Helper functions for logic (`logicHelpers.ts`) and formatting.
*   **`seed/`**: Database seeding scripts for initial data.

---

### 📡 Master API Table

| Category | Method | Endpoint | Access | Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Public | `{ name, email, registrationNumber, password, ... }` | Create student account |
| **Auth** | POST | `/api/auth/login` | Public | `{ identifier, password }` | Get JWT Token |
| **Food** | GET | `/api/food` | Public | - | List all items |
| **Cart** | POST | `/api/cart/add` | User | `{ foodId, quantity }` | Add item to cart |
| **Orders** | POST | `/api/orders` | User | `{ paymentMethod, items }` | Place order (Wallet/UPI) |
| **Admin** | POST | `/api/admin/users/:id/add-wallet` | Admin | `{ amount }` | Top up student wallet |

---

### 🚀 Running the Project

1.  **Seed the Database**:
    Populate the database with initial food items and dummy users.
    ```bash
    cd server
    npm run seed
    ```

2.  **Start Backend (Dev Mode)**:
    Runs the Express server with Nodemon for hot-reloading.
    ```bash
    cd server
    npm run dev
    ```

3.  **Start Frontend (User Portal)**:
    Launches the student application.
    ```bash
    cd client-user
    npm start
    ```

4.  **Start Frontend (Admin Portal)**:
    Launches the admin application.
    ```bash
    cd client-admin
    npm start
    ```

---


































































































































































































