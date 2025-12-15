import { useState } from 'react'
import groupService from '../features/groups/groupService'

const GroupForm = ({ onGroupCreated }) => {
  const [name, setName] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!name) {
      alert('Please enter a group name')
      return
    }

    try {
      const newGroup = await groupService.createGroup({ name })
      
      setName('')
      
      if (onGroupCreated) {
        onGroupCreated(newGroup)
      }
      
    } catch (error) {
       const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
      alert('Error creating group: ' + message)
    }
  }

  return (
    <section className="form">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="text">Group Name</label>
          <input
            type="text"
            id="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Trip to Goa"
          />
        </div>
        <div className="form-group">
          <button className="btn btn-block" type="submit">
            Add Group
          </button>
        </div>
      </form>
    </section>
  )
}

export default GroupForm