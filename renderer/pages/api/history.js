import dbConnect from "../../lib/dbConnect";
import Alert from "../../modals/Alerts";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const { deviceMac } = req.query;
      const alerts = await Alert.find({ deviceMac }).sort({_id:-1});
      return res.status(200).json(alerts);
    }
    if (req.method === "DELETE") {
      const { deviceMac } = req.query;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 15); // 15 days ago
      const alerts = await Alert.deleteMany({
        deviceMac,
        timestamp: { $lt: cutoffDate },
      });
      return res.status(200).json({
        msg: "Delete all alerts last 15 days !",
      });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error saving alert:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
