import dbConnect from "../../lib/dbConnect";
import Alert from "../../modals/Alerts";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const { deviceMac } = req.query;
      const alerts = await Alert.findOne({ deviceMac }).sort({ _id: -1 });
      return res.status(200).json(alerts);
    }

    if (req.method === "POST") {
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
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error saving alert:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
