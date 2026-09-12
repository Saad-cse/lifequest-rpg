import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Plus, Flame, Coins, CheckCircle2, Trophy } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context";
import ProgressHero from "../components/ProgressHero";
import QuestCard from "../components/QuestCard";
import QuestModal from "../components/QuestModal";
import LevelModal from "../components/LevelModal";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [tasks,setTasks] = useState([]);
  const [modal,setModal] = useState(false);
  const [levelReward,setLevelReward] = useState(null);
  const [error,setError] = useState("");

  async function load() {
    try { setTasks(await api.tasks()); } catch(e) { setError(e.message); }
  }
  useEffect(()=>{load()},[]);

  async function create(form) {
    try { const task=await api.createTask(form); setTasks([task,...tasks]); setModal(false); }
    catch(e){setError(e.message)}
  }

  async function complete(id) {
    try {
      const result=await api.completeTask(id);
      setUser(result.user);
      setTasks(await api.tasks());
      if(result.reward.levelUp) setLevelReward(result.reward);
    } catch(e){setError(e.message)}
  }

  async function remove(id) {
    try { await api.deleteTask(id); setTasks(tasks.filter(t=>t.id!==id)); }
    catch(e){setError(e.message)}
  }

  return (
    <>
      <ProgressHero user={user}/>
      <div className="dashboard-grid">
        <section className="panel quests-panel">
          <div className="section-head">
            <div className="title-with-icon"><CalendarDays/><div><h2>Today's Quests</h2><p>Complete your quests and earn rewards!</p></div></div>
            <button className="primary" onClick={()=>setModal(true)}><Plus size={17}/> Add Quest</button>
          </div>
          {error && <div className="error">{error}</div>}
          <div className="quest-list">
            {tasks.filter(t=>t.status==="pending").slice(0,5).map(t=><QuestCard key={t.id} task={t} onComplete={complete} onDelete={remove}/>)}
            {!tasks.filter(t=>t.status==="pending").length && <div className="empty"><Trophy/> No quests left. Add a new challenge!</div>}
          </div>
          <Link className="view-all" to="/quests">View all quests →</Link>
        </section>

        <aside className="side-stats">
          <section className="panel streak-panel">
            <div className="fire"><Flame/></div><div><h2>Streak</h2><strong>{user.streak} Day Streak</strong><p>Keep going! Every day counts.</p></div>
            <div className="week">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=><div key={d} className={i < Math.min(user.streak,7) ? "active":""}><span></span><small>{d}</small></div>)}</div>
          </section>
          <section className="panel quick-stats">
            <h2>Quick Stats</h2>
            <div className="quick-grid">
              <div><span>🧪</span><small>Total XP</small><b>{user.xp}</b></div>
              <div><span><Coins/></span><small>Gold</small><b>{user.gold}</b></div>
              <div><span>📗</span><small>Completed Quests</small><b>{tasks.filter(t=>t.status==="completed").length}</b></div>
            </div>
          </section>
        </aside>
      </div>
      {modal && <QuestModal onClose={()=>setModal(false)} onCreate={create}/>}
      <LevelModal reward={levelReward} onClose={()=>setLevelReward(null)}/>
    </>
  );
}
