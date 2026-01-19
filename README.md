# Campus Canteen Food Hub 🍔🍟

A modern, full-stack food ordering application designed for campus students. Built with the MEAN stack (MongoDB, Express, Angular, Node.js), it features a seamless ordering experience, real-time cart management, and a responsive UI.

## 🛠️ Technology Stack

### Frontend (Client)

- **Framework**: Angular (Latest Version)
  - **Standalone Components**: Modular architecture without NgModules.
  - **Signals**: For reactive state management (`cartItemCount`, `orderItemCount`).
  - **Dependency Injection**: Modern `inject()` based services.
- **Styling**: Bootstrap 5 + Custom CSS
  - Responsive grid layout (`col-lg-7`, `col-lg-5`).
  - Custom utility classes for glassmorphism and spacing.
  - Bootstrap Icons (`bi-cart`, `bi-trash3-fill`).
- **Routing**: Angular Router (Lazy loading ready).

### Backend (Server)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ODM**: Mongoose (for MongoDB interactions).
- **Authentication**: JsonWebToken (JWT).

### Database

- **Database**: MongoDB (NoSQL)
  - Stores `Foods`, `Users`, `Orders`.

---

## 📂 Project Structure

### Frontend (`client/src/app`)

```
src/app/
├── interceptors/           # HTTP Interceptors (Auth, Error handling)
├── pages/                  # Main route components
│   ├── menu/               # Menu Page (Food listing, Search, Categories)
│   ├── order/              # Order Page (Active Order, Order History)
│   ├── cart/               # Cart Page (Checkout flow)
│   ├── invite/             # Invite Friends Page
│   └── profile/            # User Profile Page
├── services/               # Global Data Services
│   ├── food.service.ts     # API calls to fetch food data
│   ├── cart.service.ts     # Client-side cart management
│   ├── order.service.ts    # Order state management
│   └── auth.service.ts     # User authentication
├── shared/                 # Reusable Components
│   └── top-navbar/         # Responsive Navbar with Badge Counters
├── app.config.ts           # Application config (Providers)
├── app.routes.ts           # Main Routing definition
└── app.ts                  # Root Component
```

### Backend (`server/src`)

```
src/
├── config/                 # Configuration (DB Connection)
├── controllers/            # Logic for handling requests
├── middleware/             # Express Middleware (Auth, Validation)
├── models/                 # Mongoose Schemas (Food, User, Order)
├── routes/                 # API Route Definitions
├── seed/                   # Database seeding scripts
└── server.ts               # Entry point
```

---

## 🚀 Key Features

### 1. Menu Page (`/menu`)

- **Dynamic Food Grid**: Displays food items with images, prices, and descriptions.
- **Category Filtering**: Filter by Breakfast, Lunch, Snacks, etc.
- **Real-time Search**: Search foods by name instantly.
- **Cart & Order Actions**:
  - **"Order Now"**: Directly adds item to Active Order and stays on page with a success toast.
  - **"Add to Cart"**: Adds to shopping cart for building combos.
  - **Quantity Controls**: Adjust quantity directly on the card before adding.

### 2. Order Page (`/orders`)

- **Dual-Pane Layout**:
  - **Left**: Detailed view of selected item with large image and actions.
  - **Right**: Scrollable list of ordered items (Stack view).
- **Interactive List**:
  - Click any item in the list to view details on the left.
  - **Delete Action**: Remove items with styled trash button.
  - **Navigation**: "+" button to quickly return to menu.
- **Visuals**: No-scrollbar design for a clean look, responsive layouts.

### 3. Shared Services

- **CartService**: Manages "Combo" building. Persistent across pages.
- **OrderService**: Manages "Active Orders" (Immediate orders).
- **Navbar Badges**: Real-time counter showing number of unique items in active order/cart.

---

## 📡 API Documentation

### Food Endpoints

| Method | Endpoint                        | Description                        |
| :----- | :------------------------------ | :--------------------------------- |
| `GET`  | `/api/foods`                    | Get all available food items.      |
| `GET`  | `/api/foods/search/:searchTerm` | Search foods by name.              |
| `GET`  | `/api/foods?category=Name`      | Filter foods by category tag.      |
| `GET`  | `/api/foods/:foodId`            | Get details of a single food item. |

### User Endpoints

| Method | Endpoint              | Description                       |
| :----- | :-------------------- | :-------------------------------- |
| `POST` | `/api/users/login`    | Authenticate user and return JWT. |
| `POST` | `/api/users/register` | Register a new user.              |

### Order Endpoints (Planned)

| Method | Endpoint                   | Description                   |
| :----- | :------------------------- | :---------------------------- |
| `POST` | `/api/orders`              | Create a new order.           |
| `GET`  | `/api/orders/user/:userId` | Get order history for a user. |

---

## 🏃‍♂️ How to Run

1. **Start Backend**:

   ```bash
   cd server
   npm run dev
   # Runs on http://localhost:5000 (connected to MongoDB)
   ```

2. **Start Frontend**:

   ```bash
   cd client
   ng serve
   # Runs on http://localhost:4200
   ```

3. **Browse**: Open `http://localhost:4200` to view the app.

---

Created with ❤️ for Campus Canteen.
