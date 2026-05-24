import { createContext, useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";

const context = createContext();

const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const getUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const res = await fetch("http://localhost:5000/api/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        console.error("Failed to fetch user data.");
      }
    } else {
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully.");
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <context.Provider value={{ user, getUser, logout }}>
      {children}
    </context.Provider>
  );
};

export { context, ContextProvider };
