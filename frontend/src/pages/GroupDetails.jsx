import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import groupService from '../features/groups/groupService'
import expenseService from '../features/expenses/expenseService'

const GroupDetails = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  // Form States
  const [memberEmail, setMemberEmail] = useState('')
  const [formData, setFormData] = useState({
    description: '',
    amount: ''
  })
  const { description, amount } = formData

  // --- 1. Fetch Data on Load ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Group Details
        const groupData = await groupService.getGroup(groupId)
        setGroup(groupData)

        // Fetch Expenses for this group
        const expenseData = await expenseService.getExpenses(groupId)
        setExpenses(expenseData)

      } catch (error) {
        alert("Error fetching data")
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [groupId, navigate])

  // --- 2. Action Handlers ---

  const onAddMember = async (e) => {
    e.preventDefault()
    if (!memberEmail) return
    try {
      const updatedGroup = await groupService.addMember(groupId, memberEmail)
      setGroup(updatedGroup) 
      setMemberEmail('')
      alert('Member added!')
    } catch (error) {
      alert('Error adding member')
    }
  }

  const onAddExpense = async (e) => {
    e.preventDefault()
    if (!description || !amount) {
      alert("Please fill all fields")
      return
    }

    try {
      // Send data to backend
      const expenseData = { description, amount, groupId }
      await expenseService.addExpense(expenseData)

      // Refresh list to show new expense with populated 'paidBy' name
      const freshExpenses = await expenseService.getExpenses(groupId)
      setExpenses(freshExpenses)

      setFormData({ description: '', amount: '' }) // Clear form

    } catch (error) {
       const message = (error.response && error.response.data && error.response.data.message) || error.message
      alert('Error adding expense: ' + message)
    }
  }

  const onDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId)
        // UI Update: Filter out the deleted expense locally
        setExpenses((prevExpenses) => 
          prevExpenses.filter((expense) => expense._id !== expenseId)
        )
      } catch (error) {
        alert('Error deleting expense')
      }
    }
  }

  const onDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this ENTIRE group? This cannot be undone.')) {
      try {
        await groupService.deleteGroup(groupId)
        alert('Group deleted!')
        navigate('/') // Redirect to dashboard after deletion
      } catch (error) {
        alert('Error deleting group')
      }
    }
  }

  if (loading) return <h3>Loading details...</h3>
  if (!group) return <h3>Group not found</h3>

  // --- 3. Render UI ---
  return (
    <div className="container">
      <section className="heading">
        <h1>{group.name}</h1>
        <p>Created by: {group.createdBy.name}</p>
      </section>

      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        
        {/* LEFT COLUMN: Forms */}
        <div style={{flex: 1, minWidth: '300px'}}>
           {/* Add Member Form */}
           <div style={styles.card}>
            <h3>Add Member</h3>
            <form onSubmit={onAddMember} style={{display: 'flex', gap: '10px'}}>
              <input 
                type="email" 
                placeholder="Friend's Email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                style={{flex: 1, padding: '10px'}}
              />
              <button type="submit" className="btn">Add</button>
            </form>
          </div>

          {/* Add Expense Form */}
          <div style={{...styles.card, marginTop: '20px'}}>
            <h3>Add Expense</h3>
            <form onSubmit={onAddExpense}>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Description (e.g. Dinner)"
                  value={description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <input 
                  type="number" 
                  placeholder="Amount ($)"
                  value={amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-block">Add Expense</button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Lists */}
        <div style={{flex: 1, minWidth: '300px'}}>
          
          {/* Expenses List */}
          <div style={styles.card}>
            <h3>Expenses</h3>
            {expenses.length > 0 ? (
               expenses.map((expense) => (
                 <div key={expense._id} style={styles.expenseItem}>
                   <div>
                     <strong>{expense.description}</strong>
                     <div style={{fontSize: '0.8rem', color: '#555'}}>
                       Paid by: {expense.paidBy ? expense.paidBy.name : 'Unknown'}
                     </div>
                   </div>
                   
                   <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                     <div style={{fontWeight: 'bold', color: '#2ecc71'}}>
                       ${expense.amount}
                     </div>
                     <button 
                        onClick={() => onDeleteExpense(expense._id)}
                        style={styles.deleteBtn}
                     >
                       X
                     </button>
                   </div>
                 </div>
               ))
            ) : <p>No expenses yet</p>}
          </div>

          {/* Members List */}
          <div style={{...styles.card, marginTop: '20px'}}>
            <h3>Members</h3>
            <ul>
              {group.members.map((member) => (
                <li key={member._id}>
                  {member.name} ({member.email})
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Footer / Actions */}
      <section className="content">
        <div style={styles.footerContainer} className='bottom'>
          <button className="btn" onClick={() => navigate('/')}>
             &larr; Back to Dashboard
          </button>
          
          <button 
            onClick={onDeleteGroup} 
            style={styles.dangerBtn}
          >
            Delete Group
          </button>
        </div>
      </section>

    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  expenseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #eee'
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginLeft: '10px'
  },
  footerContainer: {
    marginTop: '30px',
    borderTop: '1px solid #ccc',
    paddingTop: '20px',
    // CHANGED: Padding pushes the bottom edge down reliably
    paddingBottom: '100px', 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dangerBtn: {
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  }
}
export default GroupDetails