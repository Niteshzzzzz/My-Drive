import { model, Schema } from "mongoose";

const otpSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    otp: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})

const OTP = model('OTP', otpSchema)

export default OTP;