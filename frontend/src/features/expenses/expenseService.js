import axios from 'axios'

const API_URL = '/api/expenses/'

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = user ? user.token : null

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Add new expense
const addExpense = async (expenseData) => {
  const config = getConfig()
  // Payload: { description, amount, groupId }
  const response = await axios.post(API_URL, expenseData, config)
  return response.data
}

// Get expenses for a specific group
const getExpenses = async (groupId) => {
  const config = getConfig()
  // URL: /api/expenses/12345
  const response = await axios.get(API_URL + groupId, config)
  return response.data
}

const expenseService = {
  addExpense,
  getExpenses,
}

export default expenseService