import axios from 'axios'

const api = axios.create({
  baseURL: 'https://dlirkqmsjnlwbsfzzfjb.supabase.co/functions/v1',
  withCredentials: false,
  timeout: 15000,
})

export default api
