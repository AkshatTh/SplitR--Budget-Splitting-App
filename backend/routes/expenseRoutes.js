const express = require('express');
const router = express.Router();
const { createExpense, getExpense, deleteExpense, getGroupDebts, getUserStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');


router.get('/my-stats', protect, getUserStats);
router.post('/', protect, createExpense);
router.get('/:groupId', protect, getExpense);
router.delete('/:id', protect, deleteExpense);
router.get('/debts/:groupId', protect, getGroupDebts);




module.exports = router