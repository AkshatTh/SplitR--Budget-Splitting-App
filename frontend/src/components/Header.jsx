import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const onLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <header className='main-header'>
      <div className='header-container'>
        
        {/* Logo Section */}
        <div className='logo'>
          <Link to='/'>
            {/* Simple SVG Icon inline */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            SplitR
          </Link>
        </div>

        {/* Navigation Section */}
        <nav>
          <ul className='nav-menu'>
            {user ? (
              <>
                {/* Show User Name if logged in */}
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#e0e0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <button className='nav-btn-outline' onClick={onLogout}>
                        Logout
                    </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to='/login' className='nav-link'>
                     Login
                  </Link>
                </li>
                <li>
                  <Link to='/register' className='nav-btn'>
                     Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

      </div>
    </header>
  )
}

export default Header