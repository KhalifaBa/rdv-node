import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Configuration globale pour les cookies
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout"); // Appelle le back pour détruire le cookie
    } catch (e) { console.error(e); }

    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};