import { useEffect, useState } from "react";
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
const [categories,setCategories]=useState<{ slug:string; name:string }[]>([]);

useEffect(()=>{(async()=>{
const { data } = await supabase.from("categories").select("slug, name");
setCategories(data||[]);
})()},[]);

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
    <div className="max-w-3xl mx-auto mt-6 p-4">
    <h2 className="text-xl font-semibold">Buscar Prestadores</h2>
    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center mt-4">
    <select className="p-2 border border-gray-300 rounded" value={category} onChange={e=>setCategory(e.target.value)}>
    <option value="">Todas as categorias</option>
    {categories.map(c=>(
      <option key={c.slug} value={c.slug}>{c.name || c.slug}</option>
    ))}
    </select>
    <input className="p-2 border border-gray-300 rounded" placeholder="city" value={city} onChange={e=>setCity(e.target.value)}/>
    <input className="p-2 border border-gray-300 rounded" type="number" placeholder="radius_km (ignorado)" value={radiusKm} onChange={e=>setRadiusKm(e.target.value?Number(e.target.value):"")}/>
    <button onClick={run} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading?"Buscando...":"Buscar"}</button>
    </div>
    {err && <p className="text-red-600">{err}</p>}
    <ul className="mt-3 grid gap-2 list-none p-0">
    {results.map(r=>(
    <li key={r.id} className="border border-gray-200 rounded-lg p-3">
    <b>{r.display_name}</b> — {r.city}/{r.uf}
    <div className="text-xs text-gray-600">
    {r.hourly_rate != null ? `R$ ${r.hourly_rate}` : "Preço sob consulta"} ·
    Área {r.service_area_km??"-"} km ·
    Emergência {r.accepts_emergency?"Sim":"Não"}
    </div>
    <div className="text-xs mt-1">
    Categorias: {(r.provider_categories||[]).map(c=>c.category_slug).join(", ")||"-"}
    </div>
    </li>
    ))}
    </ul>
    </div>
);
}
