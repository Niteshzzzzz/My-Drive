import OTP from "../models/otpModel.js"
import { sendOtpService } from "../services/sendOtpService.js"

export const sendOtp = async (req, res) => {
    const {email} = req.body
    await sendOtpService(email)
    res.status(201).json({success: true, message: 'OTP sent successfully.'})
}

export const verifyOtp = async (req, res) => {
    const {email, otp} = req.body
    const otpRecord = await OTP.findOne({email, otp})
    if (!otpRecord) {
        return res.status(400).json({error: 'Invalid or Expired OTP!'})
    }
    res.status(200).json({message: 'OTP verified.'})
}