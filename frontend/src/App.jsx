import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quests from "./pages/Quests";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot">Loading your adventure…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="quests" element={<Quests />} />
        <Route path="shop" element={<Shop />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
