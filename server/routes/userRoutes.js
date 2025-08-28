import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { login, logout, logoutAll, register } from "../controllers/userController.js";

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

router.post("/logout-all", logoutAll);

export default router;
