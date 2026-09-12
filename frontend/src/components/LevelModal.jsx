import { Sparkles, Coins, X } from "lucide-react";

export default function LevelModal({ reward, onClose }) {
  if (!reward) return null;
  return (
    <div className="modal-backdrop">
      <div className="level-modal">
        <button className="modal-close" onClick={onClose}><X/></button>
        <div className="level-burst">✦</div>
        <div className="level-up">LEVEL UP!</div>
        <p>You are now Level {reward.newLevel}!</p>
        <span>Your hard work is paying off.</span>
        <div className="reward-box">
          <div>⭐ <b>+{reward.xp} XP</b></div>
          <div><Coins size={16}/> <b>+{reward.gold} Gold</b></div>
          <div><Sparkles size={16}/> <b>+{reward.attributeGain} {reward.attribute}</b></div>
        </div>
        <button className="primary full" onClick={onClose}>Awesome!</button>
      </div>
    </div>
  );
}
