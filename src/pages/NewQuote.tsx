import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function NewQuote(){
const [uid,setUid]=useState<string>("");
const [category,setCategory]=useState("");
const [description,setDescription]=useState("");
const [city,setCity]=useState("");
const [uf,setUf]=useState("");
const [times,setTimes]=useState(""); // CSV of ISO datetimes
const [budget,setBudget]=useState<number|"">("");
const [msg,setMsg]=useState("");

useEffect(()=>{(async()=>{
const { data:{ user } } = await supabase.auth.getUser();
if(user) setUid(user.id);
})()},[]);

const submit=async(e:React.FormEvent)=>{
e.preventDefault();
setMsg("Enviando...");
const preferred_times = times
.split(",")
.map(t=>t.trim())
.filter(Boolean)
.map(t=>t as unknown as any); // jsonb[] aceita strings JSON
const { error } = await supabase.from("quote_requests").insert([{
user_id: uid,
category_slug: category,
description, city, uf: uf.toUpperCase().slice(0,2),
preferred_times,
budget_max: budget === "" ? null : Number(budget)
}]);
setMsg(error ? Erro: ${error.message} : "Pedido enviado.");
if(!error){
setCategory(""); setDescription(""); setCity(""); setUf("");
setTimes(""); setBudget("");
}
};

return (
    <div style={{maxWidth:560,margin:"24px auto",padding:16,border:"1px solid #eee",borderRadius:8}}>
    <h2>Novo Pedido de Orçamento</h2>
    <form onSubmit={submit} style={{display:"grid",gap:8}}>
    <input placeholder="category_slug" value={category} onChange={e=>setCategory(e.target.value)} required/>
    <textarea placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} required rows={4}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 100px",gap:8}}>
    <input placeholder="Cidade" value={city} onChange={e=>setCity(e.target.value)} required/>
    <input placeholder="UF" value={uf} onChange={e=>setUf(e.target.value)} required/>
    </div>
    <input placeholder="preferred_times (CSV ISO8601)" value={times} onChange={e=>setTimes(e.target.value)}/>
    <input type="number" placeholder="budget_max (opcional)" value={budget} onChange={e=>setBudget(e.target.value?Number(e.target.value):"")}/>
    <button disabled={!uid}>Enviar</button>
    </form>
    {msg && <p style={{fontSize:12,color:"#555"}}>{msg}</p>}
    {!uid && <p style={{color:"crimson"}}>Faça login para criar um pedido.</p>}
    </div>
);
}