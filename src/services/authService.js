import axios from 'axios';

const API_URL = 'https://v1-27300684315.europe-west1.run.app/api/auth/login'; // Adjust if deployed

export const login = async (email, password) => {
  try {
    const response = await axios.post(API_URL, { email, password });
    return response.data; // Should include the JWT token
  } catch (error) {
    throw error.response?.data?.msg || 'Login failed';
  }
};
