import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import { deleteFile, editFileName, serveFile, uploadComplete, uploadInitiate } from "../controllers/fileController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.post('/uploads/initiate', uploadInitiate)

router.post('/uploads/complete', uploadComplete)

// router.post("/:parentDirId?", uploadFile);

router.get("/:id", serveFile);

router.patch("/:id", editFileName);

router.delete("/:id", deleteFile);

export default router;
