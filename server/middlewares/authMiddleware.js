import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";

export default async function checkAuth(req, res, next) {
  // const { id } = req.cookies;
  const {sid} = req.signedCookies;
  if (!sid) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const session = await Session.findById(sid)
  if (!session || !session.userId) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await User.findOne({ _id: session.userId });
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}

export const checkNotNormalUser = (req, res, next) => {
  if(req.user.role !== 'User') return next();
  return res.status(403).json({error: 'Not authorized to logout users!!!'})
}

export const checkAdminUser = (req, res, next) => {
  if(req.user.role === 'Admin') return next();
  return res.status(403).json({error: 'Not authorized to delete users!!!'})
}