import mongoose, { Types } from "mongoose";
import User from '../models/userModel.js'
import Directory from '../models/directoryModel.js'
import bcrypt from 'bcrypt'

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

    session.commitTransaction();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    session.abortTransaction();

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
    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }
    const jsonPayload = JSON.stringify({
      id: user._id.toString(),
      expiry: Math.round(Date.now() / 1000 + 100)
    })

    res.cookie("token", Buffer.from(jsonPayload).toString('base64url'), {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    res.json({ message: "logged in" });
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(204).end();
}