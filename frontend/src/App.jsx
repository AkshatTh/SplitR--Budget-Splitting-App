import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Header from './components/Header'

// Pages
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import GroupDetails from './pages/GroupDetails' // 👈 1. IMPORT THIS

function App() {
  return (
    <>
      <Router>
        <Header /> {/* Header is outside Routes so it shows on every page */}
        <div className='container'>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            
            {/* 👇 2. ADD THIS ROUTE */}
            {/* This tells React: "If URL is /groups/something, show GroupDetails" */}
            <Route path='/groups/:groupId' element={<GroupDetails />} />
            
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App