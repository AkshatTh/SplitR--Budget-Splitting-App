const asyncHandler = require('express-async-handler');
const Group = require('../models/Group');
const User = require('../models/User');

const createGroup = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(400);
    throw new Error('Please add a group name');
  }

  const group = await Group.create({
    name: req.body.name,
    createdBy: req.user.id, 
    members: [req.user.id], 
  });

  res.status(200).json(group);
});


const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user.id })
    .populate('createdBy', 'name email')
    .populate('members', 'name email');
  res.status(200).json(groups);
});

const addMember = asyncHandler(async (req, res) => {
  const { groupId, email } = req.body;

  const userToAdd = await User.findOne({ email });

  if (!userToAdd) {
    res.status(404);
    throw new Error('User not found');
  }

  const group = await Group.findById(groupId);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (group.members.includes(userToAdd._id)) {
    res.status(400);
    throw new Error('User is already a member');
  }

  group.members.push(userToAdd._id);
  await group.save();

  const updatedGroup = await Group.findById(groupId)
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  res.status(200).json(updatedGroup);
});





module.exports = {
  createGroup,
  getGroups,
  addMember,
};