import Alert from "../modals/Alerts";

const fetchLatestAlert = async (req, res) => {
  try {
    const { deviceMac } = req.query;

    const alerts = await Alert.findOne({ deviceMac }).sort({ _id: -1 });
    return res.status(200).json(alerts);
  } catch (error) {
    console.error("Error saving alert:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const PostAlerts = async (req, res) => {
  try {
    const { deviceMac, type, value, threshold, severity } = req.body;

    if (!deviceMac) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const alert = new Alert({
      deviceMac,
      type,
      value,
      threshold,
      severity,
      timestamp: new Date(),
    });

    await alert.save();
    return res.status(201).json(alert);
  } catch (error) {
    // Fixed error handling
    console.error("Error creating alert:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export { fetchLatestAlert };
