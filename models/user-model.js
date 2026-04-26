
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true,
    },
    email: String,
    password: String,
    cart: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            }
        ],
        default: []
    },
    orders: {
        type: Array,
        default: []
    },
    contact: Number,
    picture: Buffer,
    address: String
})


const user = mongoose.model('user', userSchema);

module.exports = user;



