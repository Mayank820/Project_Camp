import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/dbConnect.js";
import { runTaskReminderJob } from "./jobs/taskReminder.jobs.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB Connection error ", err);
    process.exit(1);
  });

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    runTaskReminderJob(); // ✅ start reminder job
  });
});
