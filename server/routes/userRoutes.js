import express from "express";
import checkAuth, { checkAdminUser, checkNotNormalUser } from "../middlewares/authMiddleware.js";
import { deleteUser, getAllUsers, login, logout, logoutAll, logoutById, register } from "../controllers/userController.js";
import User from "../models/userModel.js";

const router = express.Router();

router.post("/user/register", register);

router.post("/user/login", login);

router.get("/user", checkAuth, async (req, res) => {

  const user = await User.findById(req.user._id);
  if (user.deleted) return res.status(403).json({ error: 'Your account have been deleted. Please contact to the admin for recover!' })
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role
  });
});

router.post("/user/logout", logout);

router.post("/user/logout-all", logoutAll);

router.get("/users", checkAuth, checkNotNormalUser, getAllUsers);

router.post("/user/:userId/logout", checkAuth, checkNotNormalUser, logoutById);

router.delete('/users/:userId', checkAuth, checkAdminUser, deleteUser)

export default router;
