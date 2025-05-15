import e from "express";
const routerGlobal = e.Router();
import AlertrRouter from "./alerts";
import SettingRouter from "./settings";
import HistoryRouter from './history'

routerGlobal.use("/alerts", AlertrRouter);
routerGlobal.use("/settings", SettingRouter);
routerGlobal.use("/history", HistoryRouter);
export default routerGlobal;
