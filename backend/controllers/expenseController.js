const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = asyncHandler(async (req, res) => {
  const { description, amount, groupId } = req.body;

  if (!description || !amount || !groupId) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const expense = await Expense.create({
    description,
    amount,
    group: groupId,
    paidBy: req.user.id,
  });

  res.status(201).json(expense);
});

// @desc    Get expenses for a specific group
// @route   GET /api/expenses/:groupId
// @access  Private
const getGroupExpenses = asyncHandler(async (req, res) => {
  const groupId = req.params.groupId;

  const expenses = await Expense.find({ group: groupId })
    .populate('paidBy', 'name email') 
    .sort({ createdAt: -1 });

  res.status(200).json(expenses);
});


const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if(!expense){
    res.status(404);
    throw new Error('Expense not found');
  }

  if(expense.paidBy.toString() !== req.user.id){
    res.status(401);
    throw new Error('User not authorized to delete this expense');
  }

  await expense.deleteOne();
  res.status(200).json({ id: req.params.id });
})



module.exports = {
  addExpense,
  getGroupExpenses,
  deleteExpense,
};