import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, ListChecks, ShoppingBag, UserRound, LogOut, Menu, X, Coins, Flame } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context";

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    ["/", "Home", Home],
    ["/quests", "Quests", ListChecks],
    ["/shop", "Shop", ShoppingBag],
    ["/profile", "Profile", UserRound]
  ];

  async function signOut() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">⚔️</div>
          <div><strong>LifeQuest</strong><span>Your real life. Your adventure.</span></div>
        </div>

        <nav className="nav">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>
              <Icon size={19}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout" onClick={signOut}><LogOut size={18}/> Logout</button>
      </aside>

      {open && <div className="mobile-overlay" onClick={() => setOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(v => !v)} aria-label="Open menu">
            {open ? <X/> : <Menu/>}
          </button>
          <div>
            <h1>Good morning, {user?.name}! 👋</h1>
            <p>Small steps. Big adventures.</p>
          </div>
          <div className="top-actions">
            <span className="pill"><Flame size={15}/> {user?.streak || 0} Day Streak</span>
            <span className="pill"><Coins size={15}/> {user?.gold ?? 0}</span>
            <div className="avatar-mini">{user?.avatar || "🧙"}</div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
