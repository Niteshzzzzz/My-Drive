import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { set } from "mongoose";
dotenv.config();
const secretKey = process.env.COOKIE_SECRET || 'my_signed_cookie'

try {
  await connectDB();
  await connectRedis();

  const app = express();
  app.use(helmet())
  app.use(cookieParser(secretKey));
  app.use(express.json());
  app.use(
    cors({
      // origin: process.env.CORS_ORIGIN || ["http://localhost:5173", 'http://127.0.0.2:5500'],
      origin: ["http://localhost:5173", 'http://127.0.0.2:5500'],
      credentials: true,
    })
  );

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 50
  })

  const userLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10,
  })

  app.use(limiter)

  // function throttle(waitTime = 1000) {
  //   let throttleData = {}

  //   return (req, res, next) => {

  //     const now = Date.now();

  //     const { previousDelay, lastRequestTime } = throttleData[req.ip] || {
  //       previousDelay: 0,
  //       lastRequestTime: now - waitTime
  //     };
  //     const passedTime = now - lastRequestTime;
  //     const delay = Math.max(0, previousDelay + waitTime - passedTime);

  //     throttleData[req.ip] = {
  //       previousDelay: delay,
  //       lastRequestTime: now
  //     };

  //     setTimeout(next, delay);
  //   }
  // }

  // app.get("/", throttle(2000), (req, res) => {
  //   res.send("<h1>Welcome to the File Management API</h1>");
  // });

  app.use("/directory", checkAuth, directoryRoutes);
  app.use("/file", checkAuth, fileRoutes);
  app.use("/", userLimiter, userRoutes);
  app.use("/auth", authRoutes);

  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: "Something went wrong!" });
  });

  app.listen(4000, () => {
    console.log(`Server Started`);
  });
} catch (err) {
  console.log("Could not connect to database!");
  console.log(err);
}