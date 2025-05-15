import e from "express";
import { fetchLatestAlert, PostAlerts } from "../controller/alert";

const router = e.Router();

router.get("/getAlerts", fetchLatestAlert);
router.post("/createAlerts", PostAlerts);

export default router;
