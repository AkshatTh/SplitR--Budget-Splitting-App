import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../features/auth/authService'
import groupService from '../features/groups/groupService'
import GroupForm from '../components/GroupForm' // <--- 1. NEW IMPORT

const Dashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [groups, setGroups] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'))

        if (!loggedInUser) {
            navigate('/login')
        } else {
            setUser(loggedInUser)
            fetchGroups()
        }
    }, [navigate])

    const fetchGroups = async () => {
        try {
            const groupsData = await groupService.getGroups()
            setGroups(groupsData)
        } catch (error) {
            console.log("Error fetching groups:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // <--- 2. NEW FUNCTION: Updates the list when a new group is added
    const handleGroupCreated = (newGroup) => {
        setGroups([...groups, newGroup])
    }

    const onLogout = () => {
        authService.logout()
        navigate('/login')
    }

    if (isLoading) {
        return <h3>Loading Dashboard...</h3>
    }

    return (
        <>
            <section className="heading">
                <h1>Welcome, {user && user.name}</h1>
                <p>Your Groups</p>
            </section>

                <GroupForm onGroupCreated={handleGroupCreated} />

            <section className="content">
                {groups.length > 0 ? (
                    <div className="groups">
                        {groups.map((group) => (
                            <div key={group._id} className="group-item" style={styles.groupItem}>
                                {/* Wrap the title in a Link */}
                                <Link to={`/group/${group._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                    <h3>{group.name}</h3>
                                </Link>
                                <p style={{ fontSize: 'small' }}>Members: {group.members.length}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <h3>You have not joined any groups yet.</h3>
                )}

                <button onClick={onLogout} className="btn btn-block" style={{ marginTop: '20px' }}>
                    Logout
                </button>
            </section>
        </>
    )
}

const styles = {
    groupItem: {
        backgroundColor: '#f4f4f4',
        padding: '10px 20px',
        borderBottom: '1px solid #ddd',
        margin: '10px 0',
        borderRadius: '5px'
    }
}

export default Dashboard