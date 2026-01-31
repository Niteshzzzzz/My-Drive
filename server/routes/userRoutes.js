import express from "express";
import checkAuth, { checkAdminUser, checkNotNormalUser } from "../middlewares/authMiddleware.js";
import { deleteUser, getAllUsers, login, logout, logoutAll, logoutById, register } from "../controllers/userController.js";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import rateLimit from "express-rate-limit";

function throttle(waitTime = 1000) {
  let throttleData = {}

  return (req, res, next) => {

    const now = Date.now();

    const { previousDelay, lastRequestTime } = throttleData[req.ip] || {
      previousDelay: 0,
      lastRequestTime: now - waitTime
    };
    const passedTime = now - lastRequestTime;
    const delay = Math.max(0, previousDelay + waitTime - passedTime);

    throttleData[req.ip] = {
      previousDelay: delay,
      lastRequestTime: now
    };

    setTimeout(next, delay);
  }
}

const userLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
})

const router = express.Router();

router.post("/user/register", userLimiter, throttle(2000), register);

router.post("/user/login", userLimiter, throttle(2000), login);

router.get("/user", checkAuth, async (req, res) => {

  const user = await User.findById(req.user._id);
  if (user.deleted) return res.status(403).json({ error: 'Your account have been deleted. Please contact to the admin for recover!' })

  const usedStorageInBytes = await Directory.findById(user.rootDirId).select('size').lean();
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
    maxStorageInBytes: user.maxStorageInBytes,
    usedStorageInBytes: usedStorageInBytes.size
  });
});

router.post("/user/logout", logout);

router.post("/user/logout-all", logoutAll);

router.get("/users", checkAuth, checkNotNormalUser, getAllUsers);

router.post("/users/:userId/logout", checkAuth, checkNotNormalUser, logoutById);

router.delete('/users/:userId', checkAuth, checkAdminUser, deleteUser)

export default router;
