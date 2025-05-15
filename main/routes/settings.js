import e from "express";
import { fetchSettings, PostSettings } from "../controller/settings";

const router = e.Router();

router.get("/getSettings", fetchSettings);
router.post("/PostSettings", PostSettings);

export default router;
