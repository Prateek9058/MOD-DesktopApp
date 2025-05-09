import dbConnect from "../../lib/dbConnect";
import User from "../../modals/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const users = await User.find();
    return res.status(200).json(users);
  }

  if (req.method === "POST") {
    const { name, email } = JSON.parse(req.body);
    const user = new User({
        name:name,
        email: email
    });
    await user.save();
    return res.status(201).json(user);
  }

  res.status(405).json({ error: "Method not allowed" });
}
