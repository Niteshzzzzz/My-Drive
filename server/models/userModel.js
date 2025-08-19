import { model, Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
        minLength: 3
    },
    email: {
        type: String,
        require: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minLength: 4
    },
    rootDirId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Directory'
    }
}, {
    statics: 'throw'
})

const User = model('User', userSchema)

export default User