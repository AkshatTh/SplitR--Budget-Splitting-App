import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import groupService from '../features/groups/groupService'
import expenseService from '../features/expenses/expenseService' // <--- 1. Import Service

const GroupDetails = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([]) // <--- 2. State for Expenses
  const [loading, setLoading] = useState(true)

  // Form States
  const [memberEmail, setMemberEmail] = useState('')
  const [formData, setFormData] = useState({
    description: '',
    amount: ''
  })
  const { description, amount } = formData

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

  // --- HANDLERS ---

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
      // 1. Send data to backend
      const expenseData = { description, amount, groupId }
      const newExpense = await expenseService.addExpense(expenseData)

      // 2. Add to list immediately (Frontend Update)
      // We assume the backend returns the full object with 'paidBy' populated.
      // If 'paidBy' is just an ID in the response, we might need to refresh or trick the UI.
      // For now, let's refresh the list from server to be safe and get the populated name.
      const freshExpenses = await expenseService.getExpenses(groupId)
      setExpenses(freshExpenses)

      setFormData({ description: '', amount: '' }) // Clear form

    } catch (error) {
       const message = (error.response && error.response.data && error.response.data.message) || error.message
      alert('Error adding expense: ' + message)
    }
  }

  if (loading) return <h3>Loading details...</h3>
  if (!group) return <h3>Group not found</h3>

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
                   <div style={{fontWeight: 'bold', color: '#2ecc71'}}>
                     ${expense.amount}
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
                <li key={member._id}>{member.name}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      <button className="btn" onClick={() => navigate('/')} style={{marginTop: '20px'}}>
        Back to Dashboard
      </button>
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
  }
}

export default GroupDetails