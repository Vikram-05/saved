import { Router } from "express";
import { saveData,getData,updateKey } from "../controllers/data.controller.js";

const router = Router();

router.post("/savedata",saveData)
router.post("/get-data",getData)
router.put("/update-key",updateKey)

export default router;