import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { gitHubCallback, loginWithGoogle, redirectOnGitHub } from "../controllers/userController.js";

const router = express.Router()

router.post('/send-otp', sendOtp)

router.post('/verify-otp', verifyOtp)

router.post('/google', loginWithGoogle)

router.get("/github", redirectOnGitHub)

router.get("/github/callback", gitHubCallback)

export default router