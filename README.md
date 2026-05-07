# ⚡ TaskFlow – Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, Express, and MongoDB.

## 🚀 Live Demo
- **Frontend:** https://your-frontend.railway.app
- **Backend API:** https://your-backend.railway.app/api/health

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
**Deployment:** Railway

---

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=your_very_secret_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```
```bash
npm run dev    # starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```
Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```
```bash
npm start      # starts on http://localhost:3000
```

---

## 🌐 Deployment on Railway

### Step 1: MongoDB Atlas
1. Go to https://cloud.mongodb.com and create a free cluster
2. Create a database user (username + password)
3. Add IP `0.0.0.0/0` to Network Access
4. Copy your connection string: `mongodb+srv://user:pass@cluster.mongodb.net/teamtaskmanager`

### Step 2: Deploy Backend on Railway
1. Go to https://railway.app → New Project
2. Connect GitHub → select your repo → select `backend` folder
3. Set environment variables:
   - `MONGO_URI` = your MongoDB connection string
   - `JWT_SECRET` = any long random string
   - `NODE_ENV` = production
   - `FRONTEND_URL` = (leave empty for now, update after deploying frontend)
4. Deploy → copy the Railway URL (e.g., `https://backend-xxx.railway.app`)

### Step 3: Deploy Frontend on Railway
1. New Service in same Railway project → Connect GitHub → select `frontend` folder
2. Set environment variables:
   - `REACT_APP_API_URL` = `https://your-backend-url.railway.app/api`
3. Deploy → copy the frontend Railway URL

### Step 4: Update Backend CORS
1. Go to backend service → Variables
2. Set `FRONTEND_URL` = `https://your-frontend-url.railway.app`
3. Redeploy backend

### ✅ Test
Visit your frontend URL, create an account, and start managing tasks!

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Project.js        # Project schema
│   │   └── Task.js           # Task schema
│   ├── routes/
│   │   ├── auth.js           # /api/auth - signup, login, me
│   │   ├── projects.js       # /api/projects - CRUD + members
│   │   ├── tasks.js          # /api/tasks - CRUD
│   │   └── dashboard.js      # /api/dashboard - stats
│   ├── .env.example
│   ├── server.js             # Express app entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout.js     # Sidebar + navigation
    │   ├── context/
    │   │   └── AuthContext.js # Global auth state
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   └── ProjectDetail.js  # Kanban board + members
    │   ├── utils/
    │   │   └── api.js        # Axios API calls
    │   ├── App.js            # Routes
    │   └── index.css         # Global styles
    └── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users?email=xxx` | Search users by email |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project (Admin) |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?projectId=xxx` | Get project tasks |
| POST | `/api/tasks` | Create task (Admin) |
| PUT | `/api/tasks/:id` | Update task (Admin or Assignee) |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get stats and summaries |

---

## 🎥 Demo Video Script (2-5 min)

1. **Intro** (30s): Show the app, explain purpose
2. **Signup & Login** (30s): Create 2 accounts
3. **Create Project** (45s): Create project, add member
4. **Task Management** (90s): Create tasks, assign them, move through statuses
5. **Role-Based Access** (30s): Login as member, show restricted access
6. **Dashboard** (30s): Show stats, overdue tasks, charts

---

## 👤 Author
Your Name — [your@email.com](mailto:your@email.com)
