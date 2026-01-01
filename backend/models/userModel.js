const mongoose = require('mongoose');


const userSchema = mongoose.Schema(
    {
        name : {
            type: String,
            required : [true, 'Please add a Username'],
        },
        email : {
            type: String,
            required : [true, 'Please enter your Email'],
            unique : true,
        },
        password : {
            type: String,
            required: [true, 'Please enter a password'],
        },
    },
    {
        timestamps : true,
    }
)

module.exports = mongoose.model('User', userSchema);