import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    deviceMac: { type: String, required: true },
    type: {
      type: String,
      enum: ["Temperature", "Humidity"],
      required: true,
    },
    value: { type: Number, required: true },
    threshold: { type: Number, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
export default mongoose.models?.Alert || mongoose.model("Alert", AlertSchema);
