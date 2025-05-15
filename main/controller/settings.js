import Setting from "../modals/Settings";

const fetchSettings = async (req, res) => {
  try {
    const { device_id } = req.query;
    const settings = await Setting.findOne({ device_id }).sort({ _id: -1 });
    return res.status(200).json(settings);
  } catch (error) {
    console.error("Error saving settings:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
const PostSettings = async (req, res) => {
  try {
    const {
      defaultTempThreshold,
      defaultHumidityThreshold,
      defaultSamplingFrequency,
      defaultDataFrequency,
      device_id,
    } = req.body;
    const setting = new Setting({
      defaultTempThreshold,
      defaultHumidityThreshold,
      defaultSamplingFrequency,
      defaultDataFrequency,
      device_id,
    });
    await setting.save();
    return res.status(201).json({
      msg: "Default data set successfully!",
    });
  } catch ({ error }) {
    console.error("Error creating settings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export { PostSettings, fetchSettings };
