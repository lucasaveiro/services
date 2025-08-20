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
const [categories,setCategories]=useState<{ slug:string; name:string }[]>([]);

useEffect(()=>{(async()=>{
const [{ data:{ user } }, catRes] = await Promise.all([
supabase.auth.getUser(),
supabase.from("categories").select("slug, name")
]);
if(user) setUid(user.id);
setCategories(catRes.data||[]);
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
setMsg(error ? `Erro: ${error.message}` : "Pedido enviado.");
if(!error){
setCategory(""); setDescription(""); setCity(""); setUf("");
setTimes(""); setBudget("");
}
};

return (
    <div className="max-w-xl mx-auto mt-6 p-4 border border-gray-200 rounded-lg">
    <h2 className="text-xl font-semibold">Novo Pedido de Orçamento</h2>
    <form onSubmit={submit} className="grid gap-2 mt-4">
    <select className="p-2 border border-gray-300 rounded" value={category} onChange={e=>setCategory(e.target.value)} required>
    <option value="">Selecione uma categoria</option>
    {categories.map(c=>(
      <option key={c.slug} value={c.slug}>{c.name || c.slug}</option>
    ))}
    </select>
    <textarea className="p-2 border border-gray-300 rounded" placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} required rows={4}/>
    <div className="grid grid-cols-[1fr_100px] gap-2">
    <input className="p-2 border border-gray-300 rounded" placeholder="Cidade" value={city} onChange={e=>setCity(e.target.value)} required/>
    <input className="p-2 border border-gray-300 rounded" placeholder="UF" value={uf} onChange={e=>setUf(e.target.value)} required/>
    </div>
    <input className="p-2 border border-gray-300 rounded" placeholder="preferred_times (CSV ISO8601)" value={times} onChange={e=>setTimes(e.target.value)}/>
    <input className="p-2 border border-gray-300 rounded" type="number" placeholder="budget_max (opcional)" value={budget} onChange={e=>setBudget(e.target.value?Number(e.target.value):"")}/>
    <button disabled={!uid} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Enviar</button>
    </form>
    {msg && <p className="text-xs text-gray-600">{msg}</p>}
    {!uid && <p className="text-red-600">Faça login para criar um pedido.</p>}
    </div>
);
}
