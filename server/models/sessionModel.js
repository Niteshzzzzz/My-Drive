import { model, Schema } from "mongoose";

const sessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
}, {
    statics: 'throw'
})

const Session = model('Session', sessionSchema)

export default Session