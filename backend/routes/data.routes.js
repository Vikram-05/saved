import { Router } from "express";
import { saveData,getData,updateKey } from "../controllers/data.controller.js";
import {upload} from '../middlewares/multer.middleware.js'

const router = Router();

router.post("/savedata", upload.any(), saveData)
router.post("/get-data",getData)
router.put("/update-key",updateKey)

export default router;