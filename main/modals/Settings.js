import mongoose from "mongoose";
const AdminSettingsSchema = new mongoose.Schema(
  {
    defaultTempThreshold: { type: Number },
    defaultHumidityThreshold: { type: Number },
    defaultSamplingFrequency: { type: Number },
    defaultDataFrequency: { type: Number },
    device_id: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);
export default mongoose.models.AdminSettings || mongoose.model("AdminSettings", AdminSettingsSchema);

