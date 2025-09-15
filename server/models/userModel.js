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
        minLength: 4
    },
    rootDirId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'Directory'
    },
    picture: {
        type: String,
        default: 'https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o='
    },
    role: {
        type: String,
        enum: ['User', 'Manager', 'Admin'],
        default: 'User'
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    statics: 'throw'
})

const User = model('User', userSchema)

export default User