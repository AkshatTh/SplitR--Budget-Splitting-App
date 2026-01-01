const mongoose = require('mongoose')




const expenseSchema = mongoose.Schema(
    {
        description: {
            type: String,
            required: [true, 'Please add expense description'],
        },
        amount: {
            type: Number,
            required: [true, 'Please add amount in rupees'],
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        splits: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                amount: {
                    type: Number,
                    required: true,
                },
            },
        ],
        category: {
            type: String,
            default: 'General'
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Expense', expenseSchema)