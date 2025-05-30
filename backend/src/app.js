import express from "express";
// router imports
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import projectNoteRouter from "./routes/note.routes.js";
import subtaskRoutes from "./routes/subTask.routes.js";

const app = express();
app.use(express.json());

// upload a file
app.use("/uploads", express.static("public/uploads"));

// routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/note", projectNoteRouter);
app.use("/api/v1/subtask", subtaskRoutes);

export default app;
