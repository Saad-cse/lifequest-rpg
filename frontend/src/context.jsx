import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setUser(null);
        return;
      }
      const profile = await api.me();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) setUser(null);
      else await refreshUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    await api.login(email, password);
    await refreshUser();
  }

  async function signup(name, email, password) {
    const result = await api.signup({ name, email, password });
    // If email confirmation is enabled, there is no session yet.
    if (result.session) await refreshUser();
    else throw new Error("Account created. Check your email to confirm your account.");
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
