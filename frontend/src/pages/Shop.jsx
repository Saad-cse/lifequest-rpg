import { useEffect, useState } from "react";
import { Coins, ShoppingBag, Sparkles } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context";

export default function Shop() {
  const {user,setUser,refreshUser}=useAuth();
  const [items,setItems]=useState([]);
  const [tab,setTab]=useState("all");
  const [message,setMessage]=useState("");
  const [loadError,setLoadError]=useState("");

  async function load(){
    try { setItems(await api.shop()); setLoadError(""); }
    catch(e){ setLoadError(e.message); }
  }
  useEffect(()=>{load()},[]);

  async function buy(id){
    try { const r=await api.buy(id);setMessage(r.message);await load();await refreshUser(); }
    catch(e){setMessage(e.message)}
  }

  const shown=items.filter(i=>tab==="all"||i.type===tab);
  return <div className="page">
    <div className="page-head"><div><div className="eyebrow"><ShoppingBag/> MARKET</div><h2>Shop</h2><p>Spend your gold on useful items and customizations.</p></div><div className="gold-total"><Coins/> {user.gold}</div></div>
    <div className="shop-tabs">{["all","item","theme","badge"].map(x=><button key={x} className={tab===x?"selected":""} onClick={()=>setTab(x)}>{x==="all"?"Items":x[0].toUpperCase()+x.slice(1)}</button>)}</div>
    {message&&<div className="success">{message}</div>}
    {loadError&&<div className="error">{loadError}</div>}
    <div className="shop-grid">{shown.map(item=><article className="shop-card" key={item.id}>
      <div className="shop-icon">{item.icon}</div><h3>{item.name}</h3><p>{item.description}</p>
      <div className="price"><Coins/> {item.price}</div>
      <button className="primary full" disabled={!!item.owned} onClick={()=>buy(item.id)}>{item.owned?"Owned":"Buy"}</button>
    </article>)}</div>
    <div className="shop-tip"><Sparkles/> <span>Keep completing quests to grow your gold balance.</span></div>
  </div>
}
