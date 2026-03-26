import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
    razorpaySubscriptionId: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'created', 'active', 'paused', 'past_due', 'cancelled', 'in_grace'],
        default: 'created'
    }
}, {
    statics: 'throw',
    timestamps: true
})

const Subscription = model('Subscription', subscriptionSchema)

export default Subscription;