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
    <div style={{maxWidth:800,margin:"24px auto",padding:16}}>
        <h2>Meus Pedidos</h2>
        {err && <p style={{color:"crimson"}}>{err}</p>}
        <ul style={{listStyle:"none",padding:0,display:"grid",gap:8}}>
        {items.map(q=>(
        <li key={q.id} style={{border:"1px solid #eee",borderRadius:8,padding:12}}>
        <div><b>{q.category_slug}</b> — {q.city}/{q.uf} · {new Date(q.created_at).toLocaleString()}</div>
        <div style={{fontSize:12,color:"#555"}}>{q.description}</div>
        <div style={{fontSize:12,marginTop:4}}>
        {q.budget_max != null ? "Orçamento máx: R$ " + q.budget_max : "Sem orçamento"}
            
        </div>
        <div style={{fontSize:12,marginTop:4}}>
        Preferências: {(q.preferred_times||[]).map((t,i)=>typeof t==="string"?t:JSON.stringify(t)).join(", ")||"-"}
        </div>
        </li>
        ))}
        {items.length===0 && <li>Nenhum pedido.</li>}
        </ul>
    </div>
    );
}
