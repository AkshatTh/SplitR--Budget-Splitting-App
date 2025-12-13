const express = require('express');
const router = express.Router();
const { addExpense, getGroupExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { deleteExpense } = require('../controllers/expenseController');

router.post('/', protect, addExpense);
router.get('/:groupId', protect, getGroupExpenses);
router.delete('/:id', protect, deleteExpense);

module.exports = router;