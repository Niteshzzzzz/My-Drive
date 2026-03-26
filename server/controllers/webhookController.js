import Razorpay from "razorpay";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";

const plans = {
    plan_SVNg2EwrKQ61b8: {
        storageQuotaBytes: 2 * 1024 ** 4,
    },
    plan_SVNiLJooWlNyNQ: {
        storageQuotaBytes: 5 * 1024 ** 4,
    },
    plan_SVNj9OTywU6rQI: {
        storageQuotaBytes: 5 * 1024 ** 4,
    },
    plan_SVNkDkEC9XxaK0: {
        storageQuotaBytes: 10 * 1024 ** 4,
    },
    plan_SVNktfMJcZ0unt: {
        storageQuotaBytes: 10 * 1024 ** 4,
    },
}

export const rzpSubscriptionWebhook = async (req, res, next) => {
    
    try {
        const signature = req.headers['x-razorpay-signature']
        const isValid = Razorpay.validateWebhookSignature(JSON.stringify(req.body), signature, process.env.RZP_WEBHOOK_SECRET);
        if (isValid) {
            console.log(req.body.payload.subscription.entity);
            if (req.body.event === 'subscription.activated') {
                const rzpSubscription = req.body.payload.subscription.entity
                const subscription = await Subscription.findOne({ razorpaySubscriptionId: rzpSubscription.id })
                subscription.status = rzpSubscription.status
                await subscription.save()
                const planId = rzpSubscription.plan_id
                const user = await User.findById(rzpSubscription.notes.userId)
                user.maxStorageInBytes = plans[planId].storageQuotaBytes
                await user.save()
            }
        } else {
            console.log('Signature not verified!')
        }
        res.end('OK')
    } catch (err) {
        console.log(err)
        next(err)
    }
}