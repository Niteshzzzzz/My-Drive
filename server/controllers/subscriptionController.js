import Razorpay from 'razorpay'
import Subscription from '../models/subscriptionModel.js';

let razorpay = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET,
});

export const createSubscription = async (req, res, next) => {
    try {
        const { planId } = req.body;
        if (!planId) {
            return res.status(404).json({ message: "Plan not found" })
        }
        const newSubscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 12,
            notes: {
                userId: req.user.id
            }
        })
        const sub = await Subscription.create({
            razorpaySubscriptionId: newSubscription.id,
            userId: req.user.id
        })
        return res.json({ subscriptionId: newSubscription.id })
    } catch (err) {
        console.log(err)
        next(err)
    }
}