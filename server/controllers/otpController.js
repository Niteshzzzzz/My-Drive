import z from "zod"
import OTP from "../models/otpModel.js"
import { sendOtpService } from "../services/sendOtpService.js"
import { otpSchema } from "../validators/authValidator.js"

export const sendOtp = async (req, res) => {
    const { email } = req.body
    const {success, data, error} = z.email().safeParse(email)
    if (!success) {
        return res.status(400).json({ error: z.flattenError(error).fieldErrors })
    }
    await sendOtpService(data)
    res.status(201).json({ success: true, message: 'OTP sent successfully.' })
}

export const verifyOtp = async (req, res) => {
    const { success, data, error } = otpSchema.safeParse(req.body)
    if (!success) {
        return res.status(400).json({ error: z.flattenError(error).fieldErrors })
    }
    const { email, otp } = data
    const otpRecord = await OTP.findOne({ email, otp })
    if (!otpRecord) {
        return res.status(400).json({ error: 'Invalid or Expired OTP!' })
    }
    res.status(200).json({ message: 'OTP verified.' })
}