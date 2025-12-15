# SplitR - Budget Splitting App 💰

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![Status](https://img.shields.io/badge/Status-Completed-success)

**SplitR** is a full-stack web application designed to help friends manage shared expenses. This is a clone of Splitwise, built to demonstrate **CRUD operations**, **Authentication**, and **State Management** using the MERN stack.

This project was built as a capstone to learn Full Stack development, implementing secure backend APIs and a responsive frontend interface.

---

## 🚀 Features

* **User Authentication**: Secure Login and Registration using **JWT (JSON Web Tokens)** and **bcrypt** for password hashing.
* **Group Management**: Create, Read, and Delete expense groups.
* **Member Management**: Add friends to groups dynamically via email.
* **Expense Tracking**: Add expenses to groups with "Paid By" tracking.
* **Dynamic Dashboard**: Real-time updates of groups and expenses.
* **Protected Routes**: Prevents unauthorized access to group details.

---

## 🛠️ Tech Stack

### Frontend
* **React (Vite)**: For building the user interface.
* **React Router DOM**: For dynamic routing and navigation.
* **Axios**: For making HTTP requests to the backend.
* **CSS Modules**: For styling components.

### Backend
* **Node.js & Express.js**: RESTful API architecture.
* **MongoDB & Mongoose**: NoSQL database for storing Users, Groups, and Expenses.
* **JWT**: For stateless authentication.
* **Express Async Handler**: For clean error handling.

---

## 📂 Project Structure

```text
SplitR/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Logic for Users, Groups, Expenses
│   ├── middleware/     # Auth protection & Error handling
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Endpoints
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── features/   # API Services (Axios calls)
│   │   ├── pages/      # Dashboard, Login, Register, GroupDetails
│   │   └── components/ # Reusable UI components
│   └── vite.config.js  # Proxy configuration
└── README.md
```

## ⚙️ Installation & Run Locally

Follow these steps to set up the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/AkshatTh/SplitR--Budget-Splitting-App.git](https://github.com/AkshatTh/SplitR--Budget-Splitting-App.git)
cd SplitR--Budget-Splitting-App
```

### 2. Backend Setup
Navigate to the root directory (or backend folder) and install dependencies.
```bash
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the root folder and add the following:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Start the Server:**
```bash
npm run server
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies.
```bash
cd frontend
npm install
```

**Start the React App:**
```bash
npm run dev
# App runs on http://localhost:3000 (or 5173)
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users` | Register a new user | Public |
| **POST** | `/api/users/login` | Login user & get token | Public |
| **GET** | `/api/groups` | Get all groups for user | Private |
| **POST** | `/api/groups` | Create a new group | Private |
| **PUT** | `/api/groups/addmember` | Add member to group | Private |
| **DELETE** | `/api/groups/:id` | Delete a group | Private |
| **GET** | `/api/expenses/:groupId` | Get expenses for a group | Private |
| **POST** | `/api/expenses` | Add a new expense | Private |

---

## 🧠 Key Learnings

This project was my first deep dive into the MERN stack. Key concepts learned include:
* **Lifting State Up**: Managing state between Parent (Dashboard) and Child (GroupForm) components.
* **JWT Auth Flow**: How to generate tokens on the backend, store them in LocalStorage, and attach them to headers via Axios.
* **Database Relationships**: Linking Expenses to specific Groups and Users via MongoDB ObjectIDs.
* **Proxy Configuration**: Setting up Vite proxy to handle CORS issues between ports 5000 and 3000.

## 🔜 Future Improvements

- [ ] **Dashboard Summaries**: Show total expenses per group and total owed for the logged-in user.
- [ ] **Expense Division Algorithm**: Implement logic to divide expenses among members (not just list them).
- [ ] **Settle Up**: Add functionality for members to mark their portion as "Paid".
- [ ] **Notifications**: Integrate email notifications when a new expense is added.
- [ ] **UI Polish**: Improve the design for a cleaner user experience.

---

Made with ❤️ by [AkshatTh](https://github.com/AkshatTh)
