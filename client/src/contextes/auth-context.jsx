/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to get user from sessionStorage
    const storedUser = sessionStorage.getItem("fileNestUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => {
    // Try to get token from sessionStorage
    const storedToken = sessionStorage.getItem("fileNestToken");
    return storedToken || null;
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'user') {
        const newUser = event.newValue ? JSON.parse(event.newValue) : null;
        setUser(newUser);
        setToken(newUser ? newUser.token : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Set session storage and state when user logs in
  const login = (userData) => {
    setUser(userData);
    setToken(userData.token);
    sessionStorage.setItem("fileNestUser", JSON.stringify(userData));
    sessionStorage.setItem("fileNestToken", userData.token);
  };

  // Clear session storage and state when user logs out
  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("fileNestUser");
    sessionStorage.removeItem("fileNestToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
