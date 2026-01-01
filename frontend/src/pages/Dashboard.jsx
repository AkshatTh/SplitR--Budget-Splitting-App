import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  
  const [groups, setGroups] = useState([])
  const [stats, setStats] = useState({ totalSpent: 0, monthlySpent: 0, totalTransactions: 0 }) // 👈 NEW STATE
  const [showForm, setShowForm] = useState(false) 
  const [formData, setFormData] = useState({ name: '', description: '' })

  const { name, description } = formData

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      
      // 1. Fetch Groups
      axios.get('/api/groups', config)
        .then(res => setGroups(res.data))
        .catch(err => console.log(err))

      // 2. Fetch Personal Stats (NEW)
      axios.get('/api/expenses/my-stats', config)
        .then(res => setStats(res.data))
        .catch(err => console.log(err))
    }
  }, [user, navigate])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const config = { headers: { Authorization: `Bearer ${user.token}` } }
    try {
      const res = await axios.post('/api/groups', formData, config)
      setGroups([...groups, res.data])
      setFormData({ name: '', description: '' })
      setShowForm(false) 
    } catch (error) {
      console.log(error)
    }
  }

  const onDelete = async (groupId) => {
    if(!window.confirm("Are you sure?")) return;
    const config = { headers: { Authorization: `Bearer ${user.token}` } }
    await axios.delete(`/api/groups/${groupId}`, config)
    setGroups(groups.filter((g) => g._id !== groupId))
  }

  return (
    <div className='dashboard-page'>
      
      {/* 1. Header Section */}
      <div className="dashboard-header">
        <div>
            <h1>Welcome back, {user && user.name.split(' ')[0]}! 👋</h1>
            <p style={{marginTop: '5px'}}>Here is your financial overview.</p>
        </div>
        <button 
            className="btn" 
            onClick={() => setShowForm(!showForm)}
            style={{ background: showForm ? '#ff7675' : '#6c5ce7' }} 
        >
            {showForm ? 'Cancel' : '+ Create New Group'}
        </button>
      </div>

      {/* 👇 NEW: PERSONAL FINANCE STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          {/* Card 1: Monthly Spend */}
          <div style={{ background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0, 184, 148, 0.3)' }}>
              <h3 style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '5px' }}>Spent This Month</h3>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>₹{stats.monthlySpent}</h2>
              <small style={{ opacity: 0.8 }}>Across all groups</small>
          </div>

          {/* Card 2: Lifetime Spend */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>Total Lifetime Spend</h3>
              <h2 style={{ fontSize: '2rem', margin: 0, color: '#2d3436' }}>₹{stats.totalSpent}</h2>
              <small style={{ color: '#b2bec3' }}>{stats.totalTransactions} transactions total</small>
          </div>

          {/* Card 3: Active Groups */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>Active Groups</h3>
              <h2 style={{ fontSize: '2rem', margin: 0, color: '#6c5ce7' }}>{groups.length}</h2>
              <small style={{ color: '#b2bec3' }}>Current trips & events</small>
          </div>

      </div>

      {/* 2. Hidden Create Form */}
      {showForm && (
          <div className="create-group-box">
              <h3 style={{ marginBottom: '15px' }}>Start a new trip</h3>
              <form onSubmit={onSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                      <input 
                        type="text" 
                        name="name" 
                        value={name} 
                        onChange={onChange} 
                        placeholder="Group Name (e.g. Iceland Trip)" 
                        className="form-control"
                        required
                      />
                  </div>
                  <div style={{ flex: 2, minWidth: '300px' }}>
                      <input 
                        type="text" 
                        name="description" 
                        value={description} 
                        onChange={onChange} 
                        placeholder="Description (e.g. Flight tickets, Hotel, Food)" 
                        className="form-control"
                      />
                  </div>
                  <button type="submit" className="btn">Create Group</button>
              </form>
          </div>
      )}

      {/* 3. Groups Grid */}
      <h3 style={{marginBottom: '20px', color: '#2d3436'}}>Your Groups</h3>
      <div className="groups-grid">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group._id} className="group-card">
              <div className="group-card-header">
                  {group.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="group-card-body">
                <h3>{group.name}</h3>
                <p>{group.description || 'No description provided'}</p>
              </div>
              <div className="group-card-actions">
                <button 
                    onClick={() => navigate(`/groups/${group._id}`)} 
                    className="btn btn-block" 
                    style={{ fontSize: '0.9rem', padding: '10px' }}
                >
                    View Expenses
                </button>
                <button 
                    onClick={() => onDelete(group._id)} 
                    className="btn btn-delete" 
                    style={{ padding: '10px 15px' }}
                >
                    🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          !showForm && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#888', background: 'white', borderRadius: '12px', border: '2px dashed #ddd' }}>
                  <h3>No groups yet 🏝️</h3>
                  <p>Create your first group to start splitting bills!</p>
              </div>
          )
        )}
      </div>

    </div>
  )
}

export default Dashboard