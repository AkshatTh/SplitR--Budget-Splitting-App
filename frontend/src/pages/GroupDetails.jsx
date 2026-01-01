import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ExpenseForm from '../components/ExpenseForm'
import SpendingChart from '../components/SpendingChart'

// --- HELPER FUNCTIONS ---
const getInitials = (name) => {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
}

const stringToColor = (string) => {
    if (!string) return '#cccccc'
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

function GroupDetails() {
    const params = useParams()
    const navigate = useNavigate()

    // State Management
    const [group, setGroup] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [debts, setDebts] = useState([])

    // Form State
    const [memberEmail, setMemberEmail] = useState('')
    const [settleAmount, setSettleAmount] = useState('')
    const [settleTo, setSettleTo] = useState('')

    // 1. Get User
    const user = JSON.parse(localStorage.getItem('user'))

    // 2. Calculate Totals (Client Side Math)
    let totalSpent = 0;
    let iPaid = 0;
    let myShare = 0;

    if (expenses.length > 0) {
        expenses.forEach(expense => {
            totalSpent += expense.amount;

            const payerId = expense.paidBy._id || expense.paidBy;
            if (payerId === user._id) {
                iPaid += expense.amount;
            }

            const mySplit = expense.splits.find((s) => {
                const splitUserId = s.user._id || s.user;
                return splitUserId === user._id;
            });

            if (mySplit) {
                myShare += mySplit.amount;
            }
        })
    }

    const netBalance = iPaid - myShare;

    // 3. Fetch Data (Group, Expenses, Debts)
    useEffect(() => {
        const fetchData = async () => {
            const user = JSON.parse(localStorage.getItem('user'))
            if (!user) {
                navigate('/login')
                return
            }

            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            }

            try {
                // A. Fetch Group Info
                const groupRes = await axios.get(`/api/groups/${params.groupId}`, config)
                setGroup(groupRes.data)

                // B. Fetch Expenses
                const expenseRes = await axios.get(`/api/expenses/${params.groupId}`, config)
                setExpenses(expenseRes.data)

                // C. Fetch Simplified Debts (The Algorithm)
                const debtRes = await axios.get(`/api/expenses/debts/${params.groupId}`, config)
                setDebts(debtRes.data)

            } catch (error) {
                console.log("Error:", error)
            }
        }

        fetchData()
    }, [params.groupId, navigate]) // 👈 REMOVED 'expenses' TO PREVENT INFINITE LOOP

    if (!group) return <h3>Loading...</h3>

    // --- HANDLERS ---

    const onAddMember = async (e) => {
        e.preventDefault()
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        try {
            await axios.put(`/api/groups/${params.groupId}/member`, { email: memberEmail }, config)
            alert("Member Added!")
            window.location.reload()
        } catch (error) {
            alert(error.response?.data?.message || "Could not add member")
        }
    }

    const onSettleUp = async (e) => {
        e.preventDefault()
        if (!settleTo || !settleAmount) return alert("Please select a user and amount")

        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        const payload = {
            description: "Payment / Settlement",
            amount: Number(settleAmount),
            groupId: params.groupId,
            category: "Settlement",
            splits: [{ user: settleTo, amount: Number(settleAmount) }]
        }

        try {
            await axios.post('/api/expenses', payload, config)
            window.location.reload()
        } catch (error) {
            alert("Failed to settle up")
        }
    }

    const onDeleteExpense = async (expenseId) => {
        if (!window.confirm("Are you sure?")) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        try {
            await axios.delete(`/api/expenses/${expenseId}`, config)
            setExpenses(expenses.filter(exp => exp._id !== expenseId))
            // Ideally re-fetch debts here too, but simple deletion is fine for now
        } catch (error) {
            alert("Failed to delete expense")
        }
    }
    const onRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) return;

        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        try {
            // Call the new backend endpoint
            const res = await axios.put(
                `/api/groups/${params.groupId}/member/remove`,
                { memberId },
                config
            );

            // Update local state instantly
            setGroup(res.data);
            alert(`${memberName} has been removed.`);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to remove member");
        }
    };

    return (
        <div className='group-details-page'>

            {/* Page Title */}
            <header style={{ marginBottom: '20px' }}>
                <h1>{group.name}</h1>
                <p>{group.description}</p>
            </header>

            <div className="group-dashboard">

                {/* === LEFT COLUMN (CONTROLS) === */}
                <aside className="group-sidebar">

                    {/* 1. Summary Box */}
                    <div className="summary-box" style={{ margin: 0 }}>
                        <div>
                            <small>Total Spend</small>
                            <h2>₹{totalSpent}</h2>
                        </div>
                        <div>
                            <small>Your Share</small>
                            <h2>₹{myShare}</h2>
                        </div>
                        <div>
                            <small>Net Balance</small>
                            <h2 style={{ color: netBalance >= 0 ? '#55efc4' : '#ff7675' }}>
                                {netBalance >= 0 ? '+' : ''}₹{netBalance}
                            </h2>
                        </div>
                    </div>

                    {/* 2. Simplified Debts Box */}
                    <div className="form" style={{ padding: '20px', margin: 0, background: '#fff9c4', border: '1px solid #f9a825' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#f57f17' }}>⚡ Simplified Debts</h3>
                        {debts.length === 0 ? (
                            <p style={{ fontSize: '0.9rem', color: '#888' }}>All settled up!</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {debts.map((debt, index) => (
                                    <li key={index} style={{ marginBottom: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ fontWeight: '600', color: '#d32f2f' }}>{debt.from}</span>
                                        <span style={{ color: '#555' }}>pays</span>
                                        <span style={{ fontWeight: '600', color: '#2e7d32' }}>{debt.to}</span>
                                        <strong style={{ marginLeft: 'auto' }}>₹{debt.amount}</strong>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 3. Add Expense Form */}
                    <ExpenseForm groupId={params.groupId} members={group.members} />

                    {/* 4. Settle Up Box */}
                    <div className="form" style={{ padding: '20px', margin: 0 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>💸 Settle Up</h3>
                        <form onSubmit={onSettleUp} className="inline-form">
                            <select className="form-control" value={settleTo} onChange={(e) => setSettleTo(e.target.value)}>
                                <option value="">Select Member...</option>
                                {group.members.filter(m => m._id !== user._id).map(m => (
                                    <option key={m._id} value={m._id}>{m.name}</option>
                                ))}
                            </select>
                            <input type="number" placeholder="₹" value={settleAmount} onChange={(e) => setSettleAmount(e.target.value)} className="form-control" style={{ width: '80px' }} />
                            <button type="submit" className="btn" style={{ background: '#00b894' }}>Pay</button>
                        </form>
                    </div>

                    {/* 5. Manage Members (WITH REMOVE BUTTON) */}
                    <div className="form" style={{ padding: '20px', margin: 0 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>👥 Members</h3>
                        <ul className="member-list">
                            {group.members.map(m => (
                                <li key={m._id} className="member-chip" style={{ paddingLeft: '5px', paddingRight: '5px' }}>

                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className="avatar avatar-sm" style={{ backgroundColor: stringToColor(m.name), marginRight: '10px' }}>
                                            {getInitials(m.name)}
                                        </div>
                                        {m.name}
                                        {/* Admin Badge */}
                                        {group.createdBy === m._id && (
                                            <span style={{ fontSize: '0.7rem', background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Admin</span>
                                        )}
                                    </div>

                                    {/* 🛑 REMOVE BUTTON: Only visible to Admin, and cannot remove self */}
                                    {user._id === group.createdBy && m._id !== user._id && (
                                        <button
                                            onClick={() => onRemoveMember(m._id, m.name)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ff7675',
                                                cursor: 'pointer',
                                                marginLeft: '10px',
                                                fontSize: '1.2rem',
                                                padding: '0 5px',
                                                lineHeight: 1
                                            }}
                                            title="Remove user"
                                        >
                                            ×
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={onAddMember} className="inline-form">
                            <input type="email" placeholder="Email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required className="form-control" />
                            <button type="submit" className="btn">Add</button>
                        </form>
                    </div>

                </aside>

                {/* === RIGHT COLUMN (EXPENSE FEED) === */}
                <main className="group-feed">
                    <SpendingChart expenses={expenses} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Recent Activity</h3>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>{expenses.length} transactions</span>
                    </div>

                    <div className="expenses-list">
                        {expenses.map((expense) => (
                            <div key={expense._id} className="expense-item">

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="date-badge">
                                        <span className="date-month">{new Date(expense.createdAt).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="date-day">{new Date(expense.createdAt).getDate()}</span>
                                    </div>
                                    <div className="avatar" style={{ backgroundColor: stringToColor(expense.paidBy ? expense.paidBy.name : '?') }} title={`Paid by ${expense.paidBy ? expense.paidBy.name : 'Unknown'}`}>
                                        {getInitials(expense.paidBy ? expense.paidBy.name : '?')}
                                    </div>
                                    <div className="expense-info">
                                        <h3 style={{ marginBottom: '2px', fontSize: '1rem' }}>{expense.description}</h3>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#555' }}>
                                            Paid by <strong>{expense.paidBy ? expense.paidBy.name : 'Unknown'}</strong>
                                        </p>

                                        <div className="splits-list">
                                            {expense.splits.map((split) => {
                                                if (expense.paidBy && split.user && split.user._id === expense.paidBy._id) return null;
                                                const isSettlement = expense.category === 'Settlement' || expense.description.toLowerCase().includes('settlement');
                                                return (
                                                    <div key={split._id} style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                                                        <span style={{ fontWeight: '600' }}>{split.user ? split.user.name : 'Unknown'}</span>
                                                        {isSettlement ? (
                                                            <span style={{ color: 'green', fontWeight: '600', marginLeft: '5px' }}> received ₹{split.amount}</span>
                                                        ) : (
                                                            <> owes <span style={{ color: '#d32f2f', fontWeight: '600' }}>₹{split.amount}</span></>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="expense-amount">₹{expense.amount}</div>
                                    <button onClick={() => onDeleteExpense(expense._id)} className="btn btn-delete">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default GroupDetails;