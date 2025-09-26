import axios from 'axios'

const api = axios.create({
  baseURL: 'https://egiiqbgumgltatfljbcs.supabase.co/functions/v1',
  withCredentials: false,
  timeout: 15000,
})

export default api
