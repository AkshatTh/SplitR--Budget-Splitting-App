const mongoose = require('mongoose');


const groupSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required:[true, 'Please give a name to the Group'],
        },
        description:{
            type: String,
        },
        members:[
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);  

module.exports = mongoose.model("Group", groupSchema);