import cron from "node-cron";
import { Task } from "../models/task.models.js";
import { sendMail, taskReminderContent } from "../utils/mail.js";

const runTaskReminderJob = () => {
  // For testing: run every minute
  cron.schedule("0 9 * * *", async () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h later

    const tasksDueSoon = await Task.find({
      dueDate: { $lte: tomorrow },
      status: { $ne: "done" },
      reminderSent: false, // ✅ fixed
    }).populate("assignedTo");

    for (const task of tasksDueSoon) {
      const user = task.assignedTo;
      if (!user || !user.email) continue;

      const dueIn = Math.ceil(
        (new Date(task.dueDate) - now) / (60 * 60 * 1000),
      );

      const message =
        dueIn <= 0
          ? `The task "${task.title}" is overdue!`
          : `The task "${task.title}" is due in ${dueIn} hours.`;

      const taskUrl = `${process.env.CLIENT_URL}/dashboard/tasks`;

      await sendMail({
        email: user.email,
        subject: `⏰ Task Reminder: ${task.title}`,
        mailGenContent: taskReminderContent(
          user.username,
          task.title,
          message,
          taskUrl,
        ),
      });

      console.log("✅ Reminder sent to:", user.email);

      task.reminderSent = true;
      await task.save();
    }

    console.log(
      `[CRON] Task reminder job ran at ${new Date().toLocaleTimeString()}`,
    );
  });
};

export { runTaskReminderJob };
