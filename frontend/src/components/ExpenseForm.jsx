import { useState, useEffect } from 'react'
import axios from 'axios'

function ExpenseForm({ groupId, members }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food') 
  // Default to Today (YYYY-MM-DD) for the input field
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10)) 
  
  // Split Logic State
  const [splitMethod, setSplitMethod] = useState('EQUAL') 
  const [involvedMembers, setInvolvedMembers] = useState([])
  const [manualAmounts, setManualAmounts] = useState({})

  // Initialize all members as "involved" by default
  useEffect(() => {
    const allMemberIds = members.map(m => m._id)
    setInvolvedMembers(allMemberIds)
  }, [members])

  const handleCheckboxChange = (memberId) => {
    if (involvedMembers.includes(memberId)) {
      setInvolvedMembers(involvedMembers.filter(id => id !== memberId))
    } else {
      setInvolvedMembers([...involvedMembers, memberId])
    }
  }

  const handleAmountChange = (memberId, value) => {
    setManualAmounts(prev => ({ ...prev, [memberId]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !description) return alert("Please fill description and amount")

    const totalBill = Number(amount)
    let finalSplits = []

    // --- 1. Calculate Splits ---
    if (splitMethod === 'EQUAL') {
        if (involvedMembers.length === 0) return alert("Please select at least one person")
        
        const count = involvedMembers.length
        const share = Math.floor(totalBill / count)
        const remainder = totalBill % count

        finalSplits = involvedMembers.map((memberId, index) => ({
            user: memberId,
            // Add remainder to the first person to ensure math matches exactly
            amount: index === 0 ? share + remainder : share
        }))
    } else {
        // EXACT Amount Logic
        let currentSum = 0
        finalSplits = []
        Object.keys(manualAmounts).forEach(memberId => {
            const val = Number(manualAmounts[memberId])
            if (val > 0) {
                currentSum += val
                finalSplits.push({ user: memberId, amount: val })
            }
        })
        
        // Validation for Exact Amounts
        if (currentSum !== totalBill) {
            return alert(`Math doesn't match! Bill: ${totalBill}, Splits: ${currentSum}`)
        }
    }

    // --- 2. Smart Date Logic ---
    let finalDate = date;
    const todayStr = new Date().toISOString().substring(0, 10);
    
    // If user kept "Today", use the EXACT current time (e.g., 5:00 PM)
    // This ensures it appears at the TOP of the list immediately.
    if (date === todayStr) {
        finalDate = new Date().toISOString(); 
    } 
    // If user picked a past date, leave it as YYYY-MM-DD (Midnight)

    // --- 3. Payload Construction ---
    const payload = {
        description,
        amount: totalBill,
        groupId,
        category, 
        date: finalDate, // Send the precise date/time
        splits: finalSplits
    }

    const user = JSON.parse(localStorage.getItem('user'))
    const config = { headers: { Authorization: `Bearer ${user.token}` } }

    try {
        await axios.post('/api/expenses', payload, config)
        // Refresh page to show new expense at the top
        window.location.reload()
    } catch (error) {
        console.log(error)
        alert(error.response?.data?.message || "Failed to add expense")
    }
  }

  return (
    <section className='form-container' style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginBottom: '15px' }}>Add New Expense</h3>
      
      <form onSubmit={onSubmit}>
        
        {/* Description */}
        <div className='form-group'>
          <input
            type='text'
            className='form-control'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Description (e.g. Dinner)'
          />
        </div>

        {/* Amount & Date Row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
                type='number'
                className='form-control'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='Total (₹)'
                style={{ flex: 1 }}
            />
            <input
                type='date'
                className='form-control'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ flex: 1 }}
            />
        </div>

        {/* Category Dropdown */}
        <div className='form-group'>
            <select 
                className='form-control' 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="Food">🍔 Food</option>
                <option value="Travel">🚕 Travel</option>
                <option value="Rent">🏠 Rent</option>
                <option value="Groceries">🛒 Groceries</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Utilities">💡 Utilities</option>
                <option value="General">📄 General</option>
            </select>
        </div>

        {/* Split Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button 
                type="button"
                className={`btn ${splitMethod === 'EQUAL' ? '' : 'btn-outline'}`}
                style={{ flex: 1, background: splitMethod === 'EQUAL' ? '#6c5ce7' : '#eee', color: splitMethod === 'EQUAL' ? 'white' : 'black' }}
                onClick={() => setSplitMethod('EQUAL')}
            >
                Split Evenly

            </button>
            <button 
                type="button"
                className={`btn ${splitMethod === 'EXACT' ? '' : 'btn-outline'}`}
                style={{ flex: 1, background: splitMethod === 'EXACT' ? '#6c5ce7' : '#eee', color: splitMethod === 'EXACT' ? 'white' : 'black' }}
                onClick={() => setSplitMethod('EXACT')}
            >
                Custom Amounts
            </button>
        </div>

        {/* Member List */}
        <div className="split-details" style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
            {members.map(member => (
                <div key={member._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {splitMethod === 'EQUAL' && (
                            <input 
                                type="checkbox" 
                                checked={involvedMembers.includes(member._id)}
                                onChange={() => handleCheckboxChange(member._id)}
                                style={{ width: '18px', height: '18px' }}
                            />
                        )}
                        <span style={{ fontWeight: '500' }}>{member.name}</span>
                    </div>
                    {splitMethod === 'EXACT' && (
                        <input 
                            type="number" 
                            placeholder="₹0"
                            className="form-control"
                            style={{ width: '100px', padding: '5px' }}
                            value={manualAmounts[member._id] || ''}
                            onChange={(e) => handleAmountChange(member._id, e.target.value)}
                        />
                    )}
                </div>
            ))}
        </div>

        {/* Validation Message for Exact Mode */}
        {splitMethod === 'EXACT' && amount && (
            <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '0.9rem' }}>
                Total: ₹{amount} | 
                Assigned: ₹{Object.values(manualAmounts).reduce((a, b) => Number(a) + Number(b), 0)}
            </div>
        )}

        <button type='submit' className='btn btn-block'>
            Save Expense
        </button>
      </form>
    </section>
  )
}

export default ExpenseForm