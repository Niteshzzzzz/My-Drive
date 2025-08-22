import User from "../models/userModel.js";

export default async function checkAuth(req, res, next) {
  // const { id } = req.cookies;
  const {token} = req.signedCookies;
  if (!token) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const {id, expiry} = JSON.parse(Buffer.from(token, 'base64url').toString())
  const currentDate = Math.round(Date.now()/1000)
  if (expiry < currentDate) {
    res.clearCookie('token')
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}