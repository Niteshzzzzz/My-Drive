import express from "express";
import checkAuth, { checkAdminUser, checkNotNormalUser } from "../middlewares/authMiddleware.js";
import { deleteUser, getAllUsers, login, logout, logoutAll, logoutById, register } from "../controllers/userController.js";

const router = express.Router();

router.post("/user/register", register);

router.post("/user/login", login);

router.get("/user", checkAuth, (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    role: req.user.role
  });
});

router.post("/user/logout", logout);

router.post("/user/logout-all", logoutAll);

router.get("/users", checkAuth, checkNotNormalUser, getAllUsers);

router.post("/user/:userId/logout", checkAuth, checkNotNormalUser, logoutById);

router.delete('/user/:userId', checkAuth, checkAdminUser, deleteUser)

export default router;
