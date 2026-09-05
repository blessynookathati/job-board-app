import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoRole, setDemoRole] = useState(localStorage.getItem("jobconnect_demo_role") || "candidate");

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const token = localStorage.getItem("jobconnect_token");
      const storedRole = localStorage.getItem("jobconnect_demo_role");

      if (token) {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } else if (storedRole && storedRole !== "guest") {
        // Auto sign into demo account
        const res = await api.demoLogin(storedRole);
        if (res.success) {
          localStorage.setItem("jobconnect_token", res.accessToken);
          setUser(res.user);
        }
      } else {
        // Default to candidate demo account for instant rich experience
        const res = await api.demoLogin("candidate");
        if (res.success) {
          localStorage.setItem("jobconnect_token", res.accessToken);
          localStorage.setItem("jobconnect_demo_role", "candidate");
          setUser(res.user);
          setDemoRole("candidate");
        }
      }
    } catch (err) {
      console.warn("Auth initialization note:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem("jobconnect_token", res.accessToken);
      localStorage.removeItem("jobconnect_demo_role");
      setUser(res.user);
      setDemoRole(res.user.role);
    }
    return res;
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res.success) {
      localStorage.setItem("jobconnect_token", res.accessToken);
      localStorage.removeItem("jobconnect_demo_role");
      setUser(res.user);
      setDemoRole(res.user.role);
    }
    return res;
  };

  const switchDemoRole = async (role) => {
    setLoading(true);
    try {
      if (role === "guest") {
        localStorage.removeItem("jobconnect_token");
        localStorage.setItem("jobconnect_demo_role", "guest");
        setUser(null);
        setDemoRole("guest");
      } else {
        const res = await api.demoLogin(role);
        if (res.success) {
          localStorage.setItem("jobconnect_token", res.accessToken);
          localStorage.setItem("jobconnect_demo_role", role);
          setUser(res.user);
          setDemoRole(role);
        }
      }
    } catch (err) {
      console.error("Failed to switch demo role:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("jobconnect_token");
    localStorage.setItem("jobconnect_demo_role", "guest");
    setUser(null);
    setDemoRole("guest");
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success) setUser(res.user);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoRole,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser,
        isCandidate: user?.role === "candidate",
        isRecruiter: user?.role === "recruiter",
        isAdmin: user?.role === "admin"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
