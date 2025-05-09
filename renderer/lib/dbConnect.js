import mongoose from "mongoose";

const MONGOOSE_URI = "mongodb://localhost:27017/";
const connection = {};
async function dbConnect() {
  if (connection.isConnected) {
    console.log("Already connected");
    return;
  }
  try {
    const db = await mongoose.connect(MONGOOSE_URI || "", {});
    connection.isConnected = db.connections[0].readyState;
    console.log("DB connected successfully");
  } catch (error) {
    console.log("Database connection is failed", error);
    process.exit(1);
  }
}
export default dbConnect;
