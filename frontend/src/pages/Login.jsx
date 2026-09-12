import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context";

export default function Login() {
  const { user, login, signup } = useAuth();
  const [mode,setMode] = useState("login");
  const [form,setForm] = useState({name:"",email:"",password:""});
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);

  if (user) return <Navigate to="/" replace/>;

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (mode === "login") await login(form.email,form.password);
      else await signup(form.name,form.email,form.password);
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-sky"/><div className="auth-mountains"/>
        <div className="auth-character">🧙‍♂️</div>
        <div className="auth-copy"><h1>⚔️ LifeQuest</h1><p>Your real life. Your adventure.</p></div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-tabs"><button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>Login</button><button className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>Sign Up</button></div>
        <h2>{mode==="login"?"Welcome Back":"Begin Your Adventure"}</h2>
        <p className="muted">{mode==="login"?"Sign in to continue your journey.":"Create your hero profile."}</p>
        <form onSubmit={submit}>
          {mode==="signup" && <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}
          <label>Email address<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
          <label>Password<input type="password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Enter your password"/></label>
          {error && <div className="error">{error}</div>}
          <button className="primary full" disabled={busy}>{busy ? "Entering…" : mode==="login"?"Login":"Create Account"}</button>
        </form>
        <div className="supabase-note">🔐 Authentication powered by Supabase Auth</div>
        <small className="auth-foot">{mode==="login"?"New here? ":"Already a hero? "}<button onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Create an account":"Login"}</button></small>
      </div>
    </div>
  );
}
