import { useState } from "react";
import { X } from "lucide-react";

const categories = ["Coding","Study","Health","Personal Growth","Social"];

export default function QuestModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title:"", category:"Study", description:"", rewardXp:50 });
  const update = (key,value) => setForm(f => ({...f,[key]:value}));

  return (
    <div className="modal-backdrop">
      <form className="quest-modal" onSubmit={e => {e.preventDefault(); onCreate(form);}}>
        <button type="button" className="modal-close" onClick={onClose}><X/></button>
        <h2>Create New Quest</h2>
        <p>Turn one real-life action into progress.</p>
        <label>Quest Title<input required value={form.title} onChange={e=>update("title",e.target.value)} placeholder="e.g. Study Web Technology"/></label>
        <label>Category<select value={form.category} onChange={e=>update("category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Description<textarea value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Optional details"/></label>
        <label>Reward XP<input type="number" min="10" max="500" value={form.rewardXp} onChange={e=>update("rewardXp",e.target.value)}/></label>
        <button className="primary full">Create Quest</button>
      </form>
    </div>
  );
}
