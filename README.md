# ⚡ TaskFlow – Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, Express, and MongoDB.

## 🚀 Live Demo
- **Frontend:** https://team-task-manager-frontend-mauve.vercel.app
- **Backend API:** https://team-task-manager-production-e3c5.up.railway.app/api/health
- **GitHub:** https://github.com/Nagalakshmi292004/team-task-manager

---

## ✨ Features

### Authentication
- JWT-based signup/login
- Secure password hashing with bcryptjs
- Protected routes (frontend + backend)

### Project Management
- Create projects with name, description, and color
- Creator becomes Admin automatically
- Admin can add/remove members by email search
- Members can view their assigned projects

### Task Management
- Kanban board (To Do / In Progress / Done)
- Create tasks with title, description, due date, priority
- Assign tasks to project members
- One-click status transitions
- Overdue task highlighting

### Dashboard
- Total projects & tasks count
- Tasks by status (To Do, In Progress, Done, Overdue)
- Tasks per member bar chart
- Recent tasks table
- Overdue tasks summary

### Role-Based Access
| Feature | Admin | Member |
|---------|-------|--------|
| Create/Delete Project | ✅ | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Create/Edit/Delete Tasks | ✅ | ❌ |
| Update Own Task Status | ✅ | ✅ |
| View Project & Tasks | ✅ | ✅ |

---

## 🛠 Tech Stack

**Frontend:** React 18, React Router v6, Axios, date-fns  
**Backend:** Node.js, Express, JWT, bcryptjs, express-validator  
**Database:** MongoDB Atlas (Mongoose ODM)  
**Deployment:** Railway (Backend), Vercel (Frontend)

---

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Nagalakshmi292004/team-task-manager.git
cd team-task-manager
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create `.env` file in backend folder:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=taskflow_super_secret_key_2024
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Create `.env` file in frontend folder:
```
REACT_APP_API_URL=http://localhost:5000/api
```
```bash
npm start
```

---

## 🌐 Deployment

### Backend — Railway
- Connected GitHub repository
- Root directory set to `backend`
- Environment variables configured
- Auto-deploys on push

### Frontend — Vercel
- Connected GitHub repository
- Root directory set to `frontend`
- Environment variable `REACT_APP_API_URL` set to Railway backend URL

---

## 📁 Project Structure
team-task-manager/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── server.js
│   └── package.json
│
└── frontend/
├── src/
│   ├── components/
│   │   └── Layout.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Dashboard.js
│   │   ├── Projects.js
│   │   └── ProjectDetail.js
│   ├── utils/
│   │   └── api.js
│   └── App.js
└── package.json

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users?email=xxx` | Search users |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?projectId=xxx` | Get project tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get stats |

---

## 👤 Author
Nagalakshmi — [nagalakshmi292004@gmail.com](mailto:nagalakshmi292004@gmail.com)