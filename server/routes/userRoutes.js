import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { login, logout, register } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/", checkAuth, (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
});

router.post("/logout", logout);

export default router;
