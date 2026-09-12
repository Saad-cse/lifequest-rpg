import { Flame, Brain, Dumbbell, Heart, Sparkles } from "lucide-react";

const stats = [
  ["intellect","Intellect",Brain],
  ["strength","Strength",Dumbbell],
  ["vitality","Vitality",Heart],
  ["creativity","Creativity",Sparkles]
];

export default function ProgressHero({ user }) {
  const p = user.progression;
  return (
    <section className="hero-grid">
      <div className="character-card">
        <div className="fantasy-art">
          <div className="mountain m1"/><div className="mountain m2"/><div className="castle">🏰</div>
          <div className="sun">☀</div>
        </div>
        <div className="character-info">
          <div className="big-avatar">{user.avatar || "🧙"}</div>
          <div className="char-name">
            <h2>{user.name}</h2>
            <span>The Learner</span>
          </div>
          <div className="level-label">Level {p.level}</div>
          <div className="xp-track"><span style={{width:`${p.percent}%`}}/></div>
          <small>{p.currentXp} / {p.neededXp} XP</small>
        </div>
      </div>

      <div className="panel attributes">
        <div className="panel-title"><h2>Attributes</h2></div>
        <div className="attribute-grid">
          {stats.map(([key,label,Icon]) => (
            <div className="attribute" key={key}>
              <div className={`attr-icon ${key}`}><Icon size={24}/></div>
              <div><small>{label}</small><strong>{user[key]}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
