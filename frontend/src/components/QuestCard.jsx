import { Code2, BookOpen, Dumbbell, Leaf, Users, Check, Trash2 } from "lucide-react";

const icons = { Coding: Code2, Study: BookOpen, Health: Dumbbell, "Personal Growth": Leaf, Social: Users };

export default function QuestCard({ task, onComplete, onDelete, busy }) {
  const Icon = icons[task.category] || Leaf;
  return (
    <article className={`quest-card ${task.status === "completed" ? "done" : ""}`}>
      <div className={`quest-icon ${task.category.toLowerCase().replaceAll(" ","-")}`}><Icon size={25}/></div>
      <div className="quest-main">
        <h3>{task.title}</h3>
        <div className="quest-meta"><span>{task.category}</span><span>⭐ +{task.reward_xp} XP</span><span>🪙 +{task.reward_gold} Gold</span></div>
        {task.description && <p>{task.description}</p>}
      </div>
      <div className="quest-actions">
        {task.status === "completed"
          ? <span className="completed"><Check size={17}/> Complete</span>
          : <button className="primary small" onClick={() => onComplete(task.id)} disabled={busy}>Complete</button>}
        <button className="icon-btn danger" onClick={() => onDelete(task.id)} title="Delete quest"><Trash2 size={16}/></button>
      </div>
    </article>
  );
}
