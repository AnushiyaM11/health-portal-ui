import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/auth/login'; // Adjust if deployed

export const login = async (email, password) => {
  try {
    const response = await axios.post(API_URL, { email, password });
    return response.data; // Should include the JWT token
  } catch (error) {
    throw error.response?.data?.msg || 'Login failed';
  }
};
