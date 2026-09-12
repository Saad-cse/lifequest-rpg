import { useEffect, useState } from "react";
import { Trophy, CalendarDays, Package, Brain, Dumbbell, Heart, Sparkles } from "lucide-react";
import { api } from "../api";

export default function Profile() {
  const [data,setData]=useState(null);
  const [error,setError]=useState("");
  useEffect(()=>{api.profile().then(setData).catch(e=>setError(e.message))},[]);
  if(error)return <div className="boot error">{error}</div>;
  if(!data)return <div className="boot">Loading profile…</div>;
  const {user,completed,inventory}=data;
  const attrs=[["Intellect",user.intellect,Brain],["Strength",user.strength,Dumbbell],["Vitality",user.vitality,Heart],["Creativity",user.creativity,Sparkles]];
  return <div className="page">
    <div className="profile-hero panel">
      <div className="profile-avatar">{user.avatar||"🧙"}</div><div><div className="eyebrow">HERO PROFILE</div><h2>{user.name}</h2><p>Level {user.progression.level} · Joined {String(user.created_at).slice(0,10)}</p></div>
      <div className="profile-xp"><b>{user.xp} XP</b><div className="xp-track"><span style={{width:`${user.progression.percent}%`}}/></div></div>
    </div>
    <div className="profile-stats">{attrs.map(([name,val,Icon])=><div className="panel stat-box" key={name}><Icon/><small>{name}</small><b>{val}</b></div>)}</div>
    <div className="profile-columns">
      <section className="panel"><h2><Trophy/> Recent Activity</h2>{completed.map(x=><div className="activity" key={x.id}><span>✦</span><div><b>Completed "{x.title}"</b><small>{x.category} · +{x.reward_xp} XP · +{x.reward_gold} Gold</small></div><time>{String(x.completed_at).slice(0,16)}</time></div>)}</section>
      <section className="panel"><h2><Package/> Inventory</h2>{inventory.length?inventory.map(x=><div className="inventory-row" key={x.id}><span>{x.icon}</span><div><b>{x.name}</b><small>{x.description}</small></div></div>):<div className="empty">Your inventory is empty.</div>}</section>
    </div>
  </div>
}
