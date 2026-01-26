<div align="center">

# TS-MEAN-Stack Campus Canteen

<img src="https://img.shields.io/badge/Angular_21-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />

<p>A high-performance, type-safe Campus Canteen Food Hub built with the modern MEAN stack.</p>

</div>

## 📸 Visual Gallery

<div align="center" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
  <div>
    <h4>Profile</h4>
    <img src="https://via.placeholder.com/300x500?text=Profile+UI" alt="Profile UI" width="200" />
  </div>
  <div>
    <h4>Menu</h4>
    <img src="https://via.placeholder.com/300x500?text=Menu+UI" alt="Menu UI" width="200" />
  </div>
  <div>
    <h4>Cart</h4>
    <img src="https://via.placeholder.com/300x500?text=Cart+UI" alt="Cart UI" width="200" />
  </div>
</div>

---

## ⚙️ The TS-Node Engine

This project leverages the power of **Node.js with TypeScript** to ensure type safety, scalability, and maintainability.

### Build-Run Cycle

1.  **Development**:
    -   We use **ts-node** to execute TypeScript directly without pre-compilation.
    -   **nodemon** watches for file changes and restarts the server instantly, providing a rapid feedback loop.
    -   *Benefit*: Fast iteration and immediate error detection during feature development (e.g., testing split-bill logic).

2.  **Safety**:
    -   **Strict TypeScript types** are enforced throughout the backend.
    -   Prevents common runtime errors, such as accidentally paying with a string or floating-point precision issues in tax calculations.
    -   *Benefit*: Robust financial transactions and reliable role-based access control.

3.  **Production**:
    -   The **tsc** compiler transpiles the TypeScript code into optimized JavaScript.
    -   Output is stored in a clean `/dist` folder, ready for deployment.
    -   *Benefit*: High-performance execution with minimal overhead in the production environment.

---

## 🧠 Key Logic Table

| Feature | Implementation Logic |
| :--- | :--- |
| **Identity** | Regex-based detection checks for 'H' in Registration Number or 'hostel' in Email to assign Hosteller/Day Scholar roles. |
| **Finance** | Users start with a ₹3,000 wallet. Orders include a precise 5% tax calculation using integer arithmetic to prevent floating-point errors. |
| **Collaboration** | Shared cart sessions allow multi-user ordering via unique link generation and secure ObjectId verification. |
| **Timeline** | Real-time 15-minute cooking countdown per order, tracked from the server-side `cookingStartTime`. |

---

## 📚 API Documentation

| Endpoint | Method | Description | Inputs (Body/Params) | TS Interface |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Register a new user | `name`, `email`, `registrationNumber`, `password` | `IUser` |
| `/api/auth/login` | POST | User login | `identifier` (Email/RegNo), `password` | `AuthRequest` |
| `/api/food` | GET | List available food | - | `IFood[]` |
| `/api/cart/add` | POST | Add item to cart | `foodId`, `quantity`, `specialInstructions` | `ICartItem` |
| `/api/cart/shared` | POST | Create shared link | - | `ICart` |
| `/api/cart/join/:link`| POST | Join shared cart | `sharedLink` (param) | `ICart` |
| `/api/orders` | POST | Place an order | `paymentMethod` | `IOrder` |

---

## 🚀 Installation Guide

Follow these steps to set up the environment and start the application.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-repo/ts-mean-stack.git
cd ts-mean-stack
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file in the `server` directory (or use defaults).

```bash
# Optional: Initialize TypeScript config if needed (already included)
# npx tsc --init
```

### 3. Seed Database & Run

```bash
# Seed the database with initial food items
npm run seed

# Start the development server
npm run dev
```

The server will start at `http://localhost:5000` (or your configured port).
