import { model, Schema } from "mongoose";

const fileSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    extension: {
        type: String,
        require: true
    },
    parentDirId: {
        type: Schema.Types.ObjectId,
        require: true,
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

const File = model('File', fileSchema)

export default File