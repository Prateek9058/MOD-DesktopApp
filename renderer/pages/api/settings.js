import dbConnect from "../../lib/dbConnect";
import Setting from "../../modals/Settings";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const { device_id } = req.query;
    const settings = await Setting.findOne({ device_id }).sort({ _id: -1 });
    return res.status(200).json(settings);
  }

  if (req.method === "POST") {
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
  }

  res.status(405).json({ error: "Method not allowed" });
}
