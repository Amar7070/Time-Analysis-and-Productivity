import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async (search = "") => {
    if (!search || search.length < 3) {
      setUsers([]);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/projects/get-all-users-for-task-list-assingment?search=${search}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ users, loading, error, fetchUsers, setUsers }}>
      {children}
    </UserContext.Provider>
  );
};
