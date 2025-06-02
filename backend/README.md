# 🧩 Task Manager API (Kanban-Style)

This is a full-featured **backend API** for a Kanban-style task management system. Built using **Node.js**, **Express**, and **MongoDB**, the system supports projects, tasks, users, subtasks, file uploads, role-based permissions, and email notifications.

---

## 🚀 Features

### 🔐 Authentication
- User registration with email verification
- Login, logout, refresh tokens
- Forgot/reset password with secure email flow
- Role-based access with protected routes

### 👥 User Management
- Get current user profile
- Secure password storage (bcrypt)
- Email + username validation

### 📁 Project Management
- Create, update, delete projects
- Role-based access control (`admin`, `member`)
- Add/remove project members
- Fetch user's role in any project

### ✅ Task Management
- Create, update, delete tasks
- Assign tasks to users
- Tags, status tracking (`todo`, `in_progress`, `done`)
- Due dates with reminders
- Pagination + filtering
- Subtask support

### 📝 Notes
- Add, update, delete notes on tasks
- Notes are visible to project admins & assignees only

### 📎 File Uploads
- Attach images or documents to tasks
- Validate file size & type
- Delete individual attachments

### ⏰ Reminders
- Daily cron job to scan for due/overdue tasks
- Sends email reminders via Mailgen + Nodemailer
- Tracks `reminderSent` flag to prevent duplicates

### 📧 Email System
- Centralized mail templates using Mailgen
- Templates for:
  - Email verification
  - Password reset
  - Task assignment
  - Task reminder

---

## 📂 Folder Structure

```
src/
├── controllers/       # Request logic
├── models/            # Mongoose models
├── routes/            # Express routers
├── middlewares/       # Auth, file, validation
├── utils/             # Reusable helpers (mail, roles, async)
├── jobs/              # Scheduled cron jobs
├── validators/        # Express-validator schemas
├── db/                # DB connection
├── app.js             # Express app setup
└── index.js           # Server entry point
```

---

## ⚙️ Tech Stack

- **Node.js**, **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Nodemailer + Mailgen**
- **Multer** (file uploads)
- **Node-Cron**
- **Express-Validator**

---

## 🧪 Testing

Use [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) to test:

- `/api/v1/auth/*`
- `/api/v1/project/*`
- `/api/v1/task/*`
- `/api/v1/note/*`

Make sure to include the Bearer token after login.

---

## 📦 Environment Variables (`.env`)

```
PORT=8000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
BASE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000

MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=your_username
MAILTRAP_PASSWORD=your_password
MAILTRAP_SENDEREMAIL=no-reply@taskmanager.com
```

---

<!-- ## 📸 Screenshots (Optional for UI Integration) -->

- [ ] Login Flow
- [ ] Project Dashboard
- [ ] Task Assignments
- [ ] Email Previews (Mailgen)

---

## 🧠 Ideas for Future Enhancements

- Real-time updates with Socket.IO
- Webhooks / Slack notifications
- Label color + emoji support
- Task calendar view
- Comment threads on tasks/notes
- Activity log per project

---

## 👨‍💻 Author

Built with 💙 by Mayank Singh Chandel 