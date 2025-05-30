import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatus, TaskStatusEnmu } from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ref is required"],
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: AvailableTaskStatus,
      default: TaskStatusEnmu.TODO,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    attachments: {
      type: [
        {
          url: String,
          mimetype: String,
          size: Number,
          originalname: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
