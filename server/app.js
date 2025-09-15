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
dotenv.config();
const secretKey = process.env.COOKIE_SECRET || 'my_signed_cookie'

try {
  await connectDB();

  const app = express();
  app.use(cookieParser(secretKey));
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );

  app.use("/directory", checkAuth, directoryRoutes);
  app.use("/file", checkAuth, fileRoutes);
  app.use("/", userRoutes);
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
