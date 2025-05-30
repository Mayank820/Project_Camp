import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const SubTask = mongoose.model("SubTask", subTaskSchema);
