import axios from 'axios'
const API_URL = '/api/groups/'

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = user ? user.token : null

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

const createGroup = async (groupData) => {
  const config = getConfig()
  const response = await axios.post(API_URL, groupData, config)
  return response.data
}

const getGroups = async () => {
  const config = getConfig()
  const response = await axios.get(API_URL, config)
  return response.data
}

const getGroup = async (groupId) => {
  const config = getConfig()
  const response = await axios.get(API_URL + groupId, config)
  return response.data
}

const addMember = async (groupId, email) => {
  const config = getConfig()
  const response = await axios.put(API_URL + 'addmember', { groupId, email }, config)
  return response.data
}

const deleteGroup = async (groupId) => {
  const config = getConfig()
  const response = await axios.delete(API_URL + groupId, config)
  return response.data
}

const groupService = {
  createGroup,
  getGroups,
  getGroup, 
  addMember,
  deleteGroup,
}

export default groupService
