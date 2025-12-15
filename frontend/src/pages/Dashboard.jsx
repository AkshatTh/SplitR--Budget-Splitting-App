import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../features/auth/authService'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 1. Check Local Storage for the user
    const loggedInUser = JSON.parse(localStorage.getItem('user'))

    if (!loggedInUser) {
      // 2. If no user found, kick them to login
      navigate('/login')
    } else {
      // 3. If user exists, save to state so we can render their name
      setUser(loggedInUser)
    }
  }, [navigate])

  const onLogout = () => {
    authService.logout()
    navigate('/login')
  }

  // Prevent flashing the dashboard before redirect happens
  if (!user) {
    return <div>Loading...</div> 
  }

  return (
    <>
      <section className="heading">
        <h1>Welcome {user && user.name}</h1>
        <p>Splitting Bills Dashboard</p>
      </section>

      <section className="content">
        {/* We will put the list of expenses here later */}
        <h3>Your Groups & Expenses will go here.</h3>
        
        <button onClick={onLogout} className="btn btn-block">
          Logout
        </button>
      </section>
    </>
  )
}

export default Dashboard