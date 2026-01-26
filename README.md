# TS-MEAN-Stack Campus Canteen

<div align="center">

<img src="https://img.shields.io/badge/Angular_21-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />

<p><strong>A high-performance, type-safe Campus Canteen Food Hub built with the modern MEAN stack.</strong></p>

</div>

---

## 📖 About the Project

The **Campus Canteen Food Hub** is a full-stack web application designed to streamline food ordering for university students. It addresses common challenges like long queues, payment confusion, and lack of menu visibility.

The system distinguishes between **Hostellers** and **Day Scholars**, offers a digital wallet for seamless payments, and introduces a **Collaborative Cart** for group ordering. Built with **Angular 21** on the frontend and **Node.js/Express** with **TypeScript** on the backend, it ensures type safety and high performance.

---

## ⚙️ Node.js with TypeScript Configuration

This project uses a robust **TypeScript** configuration to ensure code quality and prevent runtime errors.

### The Engine
*   **Node.js**: The runtime environment.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.

### Workflow
1.  **Development (`npm run dev`)**:
    *   **`ts-node`**: We use `ts-node` to execute TypeScript files directly in memory, skipping the manual compilation step. This makes development incredibly fast.
    *   **`nodemon`**: Wraps `ts-node` to watch for file changes. When you save a file, the server restarts automatically.
2.  **Production (`npm start`)**:
    *   **`tsc`**: The TypeScript Compiler builds the project into the `dist/` folder.
    *   **Optimization**: The `dist/` folder contains optimized, pure JavaScript files ready for deployment.

### `tsconfig.json` Highlights
*   **`"strict": true`**: Enables all strict type-checking options (no implicit `any`, strict null checks). This forces us to write safer code.
*   **`"target": "ES2020"`**: Compiles to modern JavaScript features (like async/await).
*   **`"module": "commonjs"`**: Ensures compatibility with Node.js.

---

## 📂 Project Structure

```plaintext
root
├── client/                 # Angular 21 Frontend
│   ├── src/
│   │   ├── app/            # Components (Menu, Cart, Profile)
│   │   └── assets/         # Images and styles
│   ├── angular.json        # Angular CLI config
│   └── package.json        # Client dependencies
│
├── server/                 # Node.js + Express Backend
│   ├── src/
│   │   ├── config/         # DB Connection
│   │   ├── controllers/    # Request Handlers (Auth, Order)
│   │   ├── middleware/     # Auth & Validation
│   │   ├── models/         # Mongoose Schemas (User, Food)
│   │   ├── routes/         # API Routes
│   │   └── utils/          # Logic Helpers (Tax, Roles)
│   ├── package.json        # Server dependencies
│   └── tsconfig.json       # TypeScript Config
│
└── README.md               # Documentation
```

---

## 📸 Visual Gallery

| Profile UI | Menu UI | Cart UI |
| :---: | :---: | :---: |
| ![Profile](https://via.placeholder.com/300x500?text=Profile+UI) | ![Menu](https://via.placeholder.com/300x500?text=Menu+UI) | ![Cart](https://via.placeholder.com/300x500?text=Cart+UI) |
| *Wallet & History* | *Food Selection* | *Group Ordering* |

---

## 🚀 Key Features Explained

### 1. Login & Signup (Identity)
*   **Role Detection**: The system automatically detects if a user is a **Hosteller** or **Day Scholar**.
    *   If the **Registration Number** contains 'H' (e.g., `123H456`) or the **Email** contains 'hostel', the user is assigned the 'Hosteller' role.
*   **Security**: Passwords are hashed using `bcrypt`, and sessions are managed via JWT (JSON Web Tokens).

### 2. Profile
*   **Digital Wallet**: Every user starts with a **₹3,000** wallet balance for testing.
*   **Stats**: View total spent, total orders, and saved food combos.
*   **History**: Access past order details.

### 3. Menu
*   **Live Availability**: Browse food items with real-time stock status.
*   **Filtering**: (Planned) Filter by category or dietary preference.

### 4. Cart (Collaborative)
*   **Shared Cart**: Generate a unique link to invite friends.
*   **Real-time Joining**: Friends can join the session (securely validated via ObjectId checks) and add items to the same cart.
*   **Split Bill**: Options to split the bill equally or individually.

### 5. Order & Timer
*   **Tax Calculation**: Orders automatically include a **5% tax**, calculated with strict integer precision to avoid floating-point errors (e.g., `₹10.50` + tax becomes `₹11.03`).
*   **Cooking Timer**: Once an order is placed, a **15-minute countdown** begins, tracked from the server's `cookingStartTime`.

---

## 💻 Installation Guide

Follow these steps to run the full stack locally.

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URL)

### 🟢 Backend (Server) Setup

1.  Navigate to the server folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Seed the database (adds sample food items):
    ```bash
    npm run seed
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    *The server runs on `http://localhost:5000`*

### 🔵 Frontend (Client) Setup

1.  Open a new terminal and navigate to the client folder:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Angular application:
    ```bash
    npm start
    ```
    *(Or `ng serve` if you have Angular CLI global)*

    *The client runs on `http://localhost:4200`*

---

## 📚 API Quick Reference

| Endpoint | Method | Function | Inputs (Body/Params) | TS Interface |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Create Account | `name`, `email`, `registrationNumber`, `password` | `IUser` |
| `/api/auth/login` | POST | Login | `identifier` (Email/RegNo), `password` | `AuthRequest` |
| `/api/food` | GET | Get Menu | - | `IFood[]` |
| `/api/cart/add` | POST | Add to Cart | `foodId`, `quantity`, `specialInstructions` | `ICartItem` |
| `/api/cart/shared` | POST | Create shared link | - | `ICart` |
| `/api/cart/join/:link`| POST | Join shared cart | `sharedLink` (param) | `ICart` |
| `/api/orders` | POST | Place Order | `paymentMethod` | `IOrder` |
