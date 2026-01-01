import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}
else {
 axios.defaults.baseURL = 'http://localhost:5000';
}



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)