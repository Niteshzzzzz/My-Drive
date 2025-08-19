import { model, Schema } from "mongoose";

const directorySchema = new Schema({
    name: {
        type: String,
        require: true
    },
    parentDirId: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'Directory'
    },
    userId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    }
}, {
    statics: 'throw'
})

const Directory = model('Directory', directorySchema)

export default Directory