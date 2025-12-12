// Example API Service Wrapper for the Mobile App

const API_URL = "http://your-server-ip:3000/api/v1";

export const authService = {
  login: async (phone, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    return response.json();
  },
};

export const memberService = {
  getDashboard: async (token) => {
    const response = await fetch(`${API_URL}/members/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
