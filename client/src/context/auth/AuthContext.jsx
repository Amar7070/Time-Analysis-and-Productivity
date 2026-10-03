import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    setLoading(true); // Ensure loading state reflects refresh
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/navbar/add-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setUser(res.data.data);
        setError(null);
      }
    } catch (err) {
      console.error("AuthContext: Error fetching user details:", err);
      // If 401, maybe clear token? For now just set error.
      setError(err.message);
      setUser(null);
      // Notify user of sync failure for debugging
      // toast.error(`Sync Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (token, userData = null) => {
    localStorage.setItem("token", token);

    if (userData) {
      setUser(userData);
      setError(null);
    } else {
      await fetchUser();
    }
  };

  const logout = () => {
    localStorage.clear(); // Clear all data as requested
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    fetchUser, // Expose if manual refresh needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
