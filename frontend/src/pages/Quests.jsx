import { useEffect, useState } from "react";
import { Plus, ListChecks } from "lucide-react";
import { api } from "../api";
import QuestCard from "../components/QuestCard";
import QuestModal from "../components/QuestModal";
import LevelModal from "../components/LevelModal";
import { useAuth } from "../context";

export default function Quests() {
  const {setUser} = useAuth();
  const [tasks,setTasks]=useState([]);
  const [modal,setModal]=useState(false);
  const [reward,setReward]=useState(null);
  const [filter,setFilter]=useState("all");
  const [error,setError]=useState("");

  async function load(){try{setTasks(await api.tasks())}catch(e){setError(e.message)}}
  useEffect(()=>{load()},[]);

  async function create(form){try{const t=await api.createTask(form);setTasks([t,...tasks]);setModal(false)}catch(e){setError(e.message)}}
  async function complete(id){try{const r=await api.completeTask(id);setUser(r.user);setTasks(await api.tasks());if(r.reward.levelUp)setReward(r.reward)}catch(e){setError(e.message)}}
  async function remove(id){try{await api.deleteTask(id);setTasks(tasks.filter(x=>x.id!==id))}catch(e){setError(e.message)}}

  const shown=tasks.filter(t=>filter==="all"||t.status===filter);
  return <div className="page">
    <div className="page-head"><div><div className="eyebrow"><ListChecks/> QUEST LOG</div><h2>All Quests</h2><p>Build momentum one completed quest at a time.</p></div><button className="primary" onClick={()=>setModal(true)}><Plus/> Add Quest</button></div>
    <div className="filter-row">{["all","pending","completed"].map(x=><button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>{x}</button>)}</div>
    {error&&<div className="error">{error}</div>}
    <div className="quest-list full-list">{shown.map(t=><QuestCard key={t.id} task={t} onComplete={complete} onDelete={remove}/>)}</div>
    {modal&&<QuestModal onClose={()=>setModal(false)} onCreate={create}/>}
    <LevelModal reward={reward} onClose={()=>setReward(null)}/>
  </div>
}
