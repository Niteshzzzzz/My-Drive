import z from "zod";

export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().regex(/\d{4,}/, 'Password must be at least 4 digits long'),
})

export const registerSchema = loginSchema.extend({
    name: z.string().min(3, 'Name must be at least 3 characters long').max(30, 'Name must be at most 30 characters long'),
    otp: z.string('Please enter a valid 4 digit OTP').regex(/^\d{4}$/, 'OTP must be exactly 4 digits long.'),
})

export const otpSchema = z.object({
    otp: z.string('Please enter a valid 4 digit OTP').regex(/^\d{4}$/, 'OTP must be exactly 4 digits long.'),
    email: z.email('Invalid email address')
})