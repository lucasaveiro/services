import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Quote = {
id:string;
category_slug:string;
description:string;
city:string;
uf:string;
preferred_times:any|null;
budget_max:number|null;
created_at:string;
};

export default function MyQuotes(){
const [items,setItems]=useState<Quote[]>([]);
const [loading,setLoading]=useState(true);
const [err,setErr]=useState("");

useEffect(()=>{(async()=>{
const { data:{ user } } = await supabase.auth.getUser();
if(!user){ setLoading(false); return; }
const { data, error } = await supabase
.from("quote_requests")
.select("id,category_slug,description,city,uf,preferred_times,budget_max,created_at")
.order("created_at",{ascending:false});
if(error){ setErr(error.message); setItems([]); }
else setItems((data||[]) as Quote[]);
setLoading(false);
})()},[]);

if(loading) return null;

return (
    <div className="max-w-3xl mx-auto mt-6 p-4">
        <h2 className="text-xl font-semibold">Meus Pedidos</h2>
        {err && <p className="text-red-600">{err}</p>}
        <ul className="grid gap-2 list-none p-0 mt-4">
        {items.map(q=>(
        <li key={q.id} className="border border-gray-200 rounded-lg p-3">
        <div><b>{q.category_slug}</b> — {q.city}/{q.uf} · {new Date(q.created_at).toLocaleString()}</div>
        <div className="text-xs text-gray-600">{q.description}</div>
        <div className="text-xs mt-1">
        {q.budget_max != null ? "Orçamento máx: R$ " + q.budget_max : "Sem orçamento"}

        </div>
        <div className="text-xs mt-1">
        Preferências: {(q.preferred_times||[]).map((t,i)=>typeof t==="string"?t:JSON.stringify(t)).join(", ")||"-"}
        </div>
        </li>
        ))}
        {items.length===0 && <li>Nenhum pedido.</li>}
        </ul>
    </div>
    );
}
