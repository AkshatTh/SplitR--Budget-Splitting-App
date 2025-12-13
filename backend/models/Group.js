const mongoose = require('mongoose');

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a group name'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Group', groupSchema);