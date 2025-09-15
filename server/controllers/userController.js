import mongoose, { set, Types } from "mongoose";
import User from '../models/userModel.js'
import File from '../models/fileModel.js'
import Directory from '../models/directoryModel.js'
import bcrypt from 'bcrypt'
import Session from "../models/sessionModel.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import axios, { all } from 'axios'

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12)
  const session = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    session.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password: hashedPassword,
        rootDirId,
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
  await session.abortTransaction();
  session.endSession();

    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else if (err.code === 11000) {
      return res.status(409).json({
        error: "Email already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }
    else {
      next(err);
    }
  }
}

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user.deleted) return res.status(403).json({ error: 'Your account have been deleted. Please contact to the admin for recover!' })

    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    const allSessions = await Session.find({ userId: user.id })
    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne()
    }

    const session = await Session.create({ userId: user._id })

    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    res.json({ message: "logged in" });
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findByIdAndDelete(sid)
  res.clearCookie("sid");
  res.status(204).end();
}

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;
  const session = await Session.findById(sid)
  await Session.deleteMany({ userId: session.userId })
  res.clearCookie("sid");
  res.status(204).end();
}

export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body
  const { email, name, picture, sub } = await verifyIdToken(idToken)
  const user = await User.findOne({ email })
  if (user.deleted) return res.status(403).json({ error: 'Your account have been deleted. Please contact to the admin for recover!' })
  if (user) {
    const allSessions = await Session.find({ userId: user.id })
    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne()
    }
    if (!user.picture.includes('googleusercontent.com')) {
      user.picture = picture;
      await user.save()
    }
    const session = await Session.create({ userId: user._id })

    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    return res.json({ message: "logged in" });
  }
  const mongooseSession = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mongooseSession.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session: mongooseSession }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        rootDirId,
        picture
      },
      { session: mongooseSession }
    );

  const session = await Session.create({ userId: userId })

    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });

  await mongooseSession.commitTransaction();
  mongooseSession.endSession();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
  await mongooseSession.abortTransaction();
  mongooseSession.endSession();

    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    }
    else {
      next(err);
    }
  }
}

const clientId = process.env.GITHUB_CLIENT_ID
const clientSecret = process.env.GITHUB_CLIENT_SECRET
export const redirectOnGitHub = (req, res, next) => {
  const redirect_uri = "http://localhost:4000/auth/github/callback";
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirect_uri}&scope=user:email`
  );
}


export const gitHubCallback = async (req, res, next) => {
  const code = req.query.code;
  const mongooseSession = await mongoose.startSession();

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const access_token = tokenResponse.data.access_token;

    // Fetch user profile
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const data = {
      id: userResponse.data.id,
      name: userResponse.data.name,
      avatar: userResponse.data.avatar_url,
      email: emailResponse.data.find((e) => e.primary).email,
    };

    const { name, email, id, avatar: picture } = data

    // Here you can create/find user in DB and generate your own JWT
    // For demo, we’ll just send user data

    const user = await User.findOne({ email })
    if (user.deleted) return res.status(403).json({ error: 'Your account have been deleted. Please contact to the admin for recover!' })

    if (user) {
      const allSessions = await Session.find({ userId: user.id })
      if (allSessions.length >= 2) {
        await allSessions[0].deleteOne()
      }
      if (!user.picture.includes('githubusercontent.com')) {
        user.picture = picture;
        await user.save()
      }
      const session = await Session.create({ userId: user._id })

      res.cookie("sid", session.id, {
        httpOnly: true,
        signed: true,
        maxAge: 60 * 1000 * 60 * 24 * 7,
      });
      return res.send(`
      <script>
        window.opener.postMessage(${JSON.stringify({ githubLogin: true })}, "*");
        window.close();
      </script>
    `);
    }

    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mongooseSession.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session: mongooseSession }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        rootDirId,
        picture
      },
      { session: mongooseSession }
    );

    const session = await Session.create({ userId: userId })

    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });

  await mongooseSession.commitTransaction();
  mongooseSession.endSession();

    res.send(`
      <script>
        window.opener.postMessage(${JSON.stringify({ githubLogin: true })}, "*");
        window.close();
      </script>
    `);
  } catch (err) {
  await mongooseSession.abortTransaction();
  mongooseSession.endSession();

    if (err.code === 121) {
      res

        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
      res.send("<script>window.close();</script>");
    }
    else {
      next(err);
    }
  }
}

export const getAllUsers = async (req, res, next) => {
  const allUsers = await User.find({ deleted: false }).lean()
  const allSessions = await Session.find().select('userId').lean()
  const allSessionsId = allSessions.map(({ userId }) => userId.toString())
  const allSessionsIdSet = new Set(allSessionsId)
  const allFinalUsers = allUsers.map(({ _id, name, email }) => ({
    id: _id,
    name,
    email,
    isLoggedIn: allSessionsIdSet.has(_id.toString())
  }))
  res.json(allFinalUsers)
}

export const logoutById = async (req, res, next) => {
  try {
    await Session.deleteMany({ userId: req.params.userId })
    res.status(204).json({ message: 'User logged out success.' })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params
    if(req.user._id.toString() === userId) return res.status(403).json({error: 'You cannot delete yourself!'})
    await Session.deleteMany({ userId })
    await User.findByIdAndUpdate(userId, { deleted: true })
    // await File.deleteMany({userId})
    // await Directory.deleteMany({userId})
    // await User.findByIdAndDelete(userId)
    res.status(204).json({ message: 'User deleted successfully.' })
  } catch (error) {
    next(error)
  }
}