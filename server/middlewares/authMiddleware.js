import redisClient from "../config/redis.js";
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";

export default async function checkAuth(req, res, next) {
  // const { id } = req.cookies;
  const { sid } = req.signedCookies;
  if (!sid) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const session = await redisClient.json.get(`session:${sid}`)

  if (!session || !session.userId) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await User.findOne({ _id: session.userId });
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  if (user.deleted) return res.status(403).json({ error: 'Your account have been deleted. Please contact to the admin for recover!' })

  req.user = user;
  next();
}

export const checkNotNormalUser = (req, res, next) => {
  if (req.user.role !== 'User') return next();
  return res.status(403).json({ error: 'Not authorized to logout users!!!' })
}

export const checkAdminUser = (req, res, next) => {
  // console.log(req.user)
  if (req.user.role === 'Admin') return next();
  return res.status(403).json({ error: 'Not authorized to delete users!!!' })
}