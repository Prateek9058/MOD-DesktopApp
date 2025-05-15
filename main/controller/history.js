import Alert from "../modals/Alerts";

const fetchHistory = async (req, res) => {
  try {
    const { deviceMac } = req.query;

    const alerts = await Alert.find({ deviceMac }).sort({ _id: -1 });
    return res.status(200).json(alerts);
  } catch (error) {
    console.error("Error history:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { deviceMac } = req.query;
    const cutoffDate = new Date();
    console.log("device", deviceMac);
    if (!deviceMac) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    cutoffDate.setDate(cutoffDate.getDate() - 15); // 15 days ago
    const alerts = await Alert.deleteMany({
      deviceMac,
      timestamp: { $lt: cutoffDate },
    });
    return res.status(200).json({
      msg: "Delete all alerts last 15 days !",
    });
  } catch (error) {
    // Fixed error handling
    console.error("Error creating history:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export { fetchHistory };
