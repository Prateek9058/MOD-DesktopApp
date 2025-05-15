import e from "express";
import { fetchHistory, deleteHistory } from "../controller/history";

const router = e.Router();

router.get("/getHistory", fetchHistory);
router.delete("/deleteHistory", deleteHistory);

export default router;
