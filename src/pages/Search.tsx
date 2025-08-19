import { useState } from "react";
import { supabase } from "../lib/supabase";

type ProviderRow = {
id:string; display_name:string; city:string; uf:string;
hourly_rate:number|null; service_area_km:number|null; accepts_emergency:boolean;
provider_categories: { category_slug:string }[] | null;
};

export default function Search(){
const [category,setCategory]=useState("");
const [city,setCity]=useState("");
const [radiusKm,setRadiusKm]=useState<number|"">("");
const [loading,setLoading]=useState(false);
const [results,setResults]=useState<ProviderRow[]>([]);
const [err,setErr]=useState("");

const run = async ()=>{
setLoading(true); setErr("");
let q = supabase
.from("providers")
.select("id, display_name, city, uf, hourly_rate, service_area_km, accepts_emergency, provider_categories(category_slug)", { count:"exact" });

if(city) q = q.ilike("city", city);
if(category) q = q.eq("provider_categories.category_slug", category).not("provider_categories","is",null);

const { data, error } = await q;
if(error){ setErr(error.message); setResults([]); setLoading(false); return; }

// radius_km ignorado; simulamos filtro por cidade apenas
setResults((data||[]) as ProviderRow[]);
setLoading(false);


};

return (
    <div style={{maxWidth:720,margin:"24px auto",padding:16}}>
    <h2>Buscar Prestadores</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:8,alignItems:"center"}}>
    <input placeholder="category_slug" value={category} onChange={e=>setCategory(e.target.value)}/>
    <input placeholder="city" value={city} onChange={e=>setCity(e.target.value)}/>
    <input type="number" placeholder="radius_km (ignorado)" value={radiusKm} onChange={e=>setRadiusKm(e.target.value?Number(e.target.value):"")}/>
    <button onClick={run} disabled={loading}>{loading?"Buscando...":"Buscar"}</button>
    </div>
    {err && <p style={{color:"crimson"}}>{err}</p>}
    <ul style={{marginTop:12,display:"grid",gap:8,listStyle:"none",padding:0}}>
    {results.map(r=>(
    <li key={r.id} style={{border:"1px solid #eee",borderRadius:8,padding:12}}>
    <b>{r.display_name}</b> — {r.city}/{r.uf}
    <div style={{fontSize:12,color:"#555"}}>
    {r.hourly_rate!=null?R$ ${r.hourly_rate}:"Preço sob consulta"} ·
    Área {r.service_area_km??"-"} km ·
    Emergência {r.accepts_emergency?"Sim":"Não"}
    </div>
    <div style={{fontSize:12,marginTop:4}}>
    Categorias: {(r.provider_categories||[]).map(c=>c.category_slug).join(", ")||"-"}
    </div>
    </li>
    ))}
    </ul>
    </div>
);
}