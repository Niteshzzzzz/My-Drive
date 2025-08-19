import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import { deleteFile, editFileName, serveFile, uploadFile } from "../controllers/fileController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.post("/:parentDirId?", uploadFile);

router.get("/:id", serveFile);

router.patch("/:id", editFileName);

router.delete("/:id", deleteFile);

export default router;
