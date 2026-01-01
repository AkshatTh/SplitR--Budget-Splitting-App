const asyncHandler = require('express-async-handler');
const Expense = require('../models/expenseModel');


const createExpense = asyncHandler(async (req, res) => {
    const { amount, description, groupId, splits, category, date } = req.body;

    if (!amount || !description || !groupId || !splits) {
        res.status(400);
        throw new Error("Please fill all fields");
    }
    else {
        const totalSplits = splits.reduce((acc, curr) => acc + curr.amount, 0);
        if (totalSplits !== amount) {
            res.status(400)
            throw new Error('total split is not equal to the amount entered!');
        }
        else {
            const expense = await Expense.create(
                {
                    description,
                    amount,
                    group: groupId,
                    paidBy: req.user.id,
                    splits: splits,
                    category,
                    createdAt: date || Date.now()
                }
            )
            console.log("Created Expense:", expense)
            res.status(201).json(expense);
        }
    }
})

const getExpense = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ group: req.params.groupId })
        .populate('paidBy', 'name')          // 👈 Existing: Who paid?
        .populate('splits.user', 'name')     // 👈 NEW: Who owes?
        .sort({ createdAt: -1, _id: -1 })           // Optional: Show newest first

    res.status(200).json(expenses)
})

const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id)

    if (!expense) {
        res.status(404)
        throw new Error('Expense not found')
    }

    // Optional Security: Check if the user belongs to the group of this expense
    // For now, we will allow anyone in the group to delete it (Wiki style)

    await expense.deleteOne() // or expense.remove() depending on Mongoose version

    res.status(200).json({ id: req.params.id })
})



// --- MINIMIZE CASH FLOW ALGORITHM ---
const getGroupDebts = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    // 1. Fetch all expenses in this group
    const expenses = await Expense.find({ group: groupId })
        .populate('paidBy', 'name')
        .populate('splits.user', 'name');

    // 2. Calculate Net Balance for every user (Credit vs Debit)
    // Map: { "UserID": 500 }  (Positive = They are owed money, Negative = They owe money)
    let balances = {};
    let userNames = {}; // Helper to store names

    expenses.forEach(exp => {
        // The Payer is "Owed" the total amount they paid
        const payerId = exp.paidBy._id.toString();
        if (!balances[payerId]) balances[payerId] = 0;
        balances[payerId] += exp.amount;
        userNames[payerId] = exp.paidBy.name;

        // The Splitters "Owe" their share
        exp.splits.forEach(split => {
            const debtorId = split.user._id ? split.user._id.toString() : split.user.toString();
            if (!balances[debtorId]) balances[debtorId] = 0;
            balances[debtorId] -= split.amount;

            if (split.user.name) userNames[debtorId] = split.user.name;
        });
    });

    // 3. Separate into Debtors (Negative) and Creditors (Positive)
    let debtors = [];
    let creditors = [];

    Object.keys(balances).forEach(userId => {
        const amount = balances[userId];
        if (amount < -0.1) debtors.push({ id: userId, amount: amount }); // Owe money
        if (amount > 0.1) creditors.push({ id: userId, amount: amount }); // Owed money
    });

    // Sort to optimize matching (Greedy Approach)
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (Max debt first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (Max credit first)

    // 4. The Matching Loop
    let transactions = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the minimum of (Debt vs Credit)
        // e.g. If I owe 100, and you need 50, I pay you 50.
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Record the simplified transaction
        if (amount > 0) {
            transactions.push({
                from: userNames[debtor.id] || 'Unknown',
                to: userNames[creditor.id] || 'Unknown',
                amount: Math.round(amount)
            });
        }

        // Adjust balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // If settled, move to next person
        if (Math.abs(debtor.amount) < 0.1) i++;
        if (creditor.amount < 0.1) j++;
    }

    res.status(200).json(transactions);
});


const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Find all expenses where the user is listed in the 'splits'
    const expenses = await Expense.find({ 'splits.user': userId });

    let totalSpent = 0;
    let monthlySpent = 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    expenses.forEach(exp => {
        // Find the user's specific split in this expense
        const mySplit = exp.splits.find(s => s.user.toString() === userId.toString());
        
        if (mySplit) {
            totalSpent += mySplit.amount;

            // Check if this expense is from the current month
            const expDate = new Date(exp.createdAt); // or exp.date if you used the backdate fix
            if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
                monthlySpent += mySplit.amount;
            }
        }
    });

    res.status(200).json({
        totalSpent,
        monthlySpent,
        totalTransactions: expenses.length
    });
});


module.exports = {
    createExpense,
    getExpense,
    deleteExpense,
    getGroupDebts,
    getUserStats,
}