const asyncHandler = require('express-async-handler');
const Group = require('../models/groupModel');
// Import Expense model at the top if you haven't already
const Expense = require('../models/expenseModel') 


const createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    res.status(400)
    throw new Error("Please add a group name");
  }
  else {
    const group = await Group.create({
      name,
      description,
      "createdBy": req.user.id,
      "members": [req.user.id],
    })
    res.status(201).json(group)
  }
})


const getGroups = asyncHandler(async (req, res) => {

  const groups = await Group.find({ members: req.user.id })
  res.status(200).json(groups)
})


const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('members', 'name email')
  if (!group) {
    res.status(404)
    throw new Error('Group not found')
  }

const isMember = group.members.some(member => member._id.toString() === req.user.id)

  if (!isMember) {
    res.status(401)
    throw new Error('Not authorized to view this group')
  }

  res.status(200).json(group)
})


const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body

  // 1. Find the User by Email
  const userToAdd = await require('../models/userModel').findOne({ email })

  if (!userToAdd) {
    res.status(404)
    throw new Error('User not found')
  }

  // 2. Find the Group
  const group = await Group.findById(req.params.id)

  if (!group) {
    res.status(404)
    throw new Error('Group not found')
  }

  // 3. Check if already a member
  if (group.members.includes(userToAdd._id)) {
    res.status(400)
    throw new Error('User is already in this group')
  }

  // 4. Add them
  group.members.push(userToAdd._id)
  await group.save()

  res.status(200).json(group)
})


// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)

  if (!group) {
    res.status(404)
    throw new Error('Group not found')
  }

  // Security: Only the Creator can delete? 
  // For now, let's say ANY member can delete (like WhatsApp)
  if (!group.members.includes(req.user.id)) {
      res.status(401)
      throw new Error('User not in group')
  }

  // 1. Delete all expenses inside this group first (Cleanup)
  await Expense.deleteMany({ group: req.params.id })

  // 2. Delete the group
  await group.deleteOne()

  res.status(200).json({ id: req.params.id })
})

// Remove Member (Only for Group Admin)
const removeMember = asyncHandler(async (req, res) => {
    const groupId = req.params.id;
    const { memberId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    // 1. Security Check: Only the Creator can remove people
    if (group.createdBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized. Only the group creator can remove members.');
    }

    // 2. Prevent removing yourself (Admin cannot leave their own group this way)
    if (memberId === group.createdBy.toString()) {
        res.status(400);
        throw new Error('You cannot remove yourself from the group');
    }

    // 3. Remove the user from the members array
    group.members = group.members.filter(id => id.toString() !== memberId);
    
    await group.save();

    // Return the updated group (populated so frontend updates instantly)
    const updatedGroup = await Group.findById(groupId).populate('members', 'name email');
    res.status(200).json(updatedGroup);
});


module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  deleteGroup,
  removeMember,
}