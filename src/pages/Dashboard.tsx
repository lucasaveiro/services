import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Dashboard({email}:{email:string}){
const nav=useNavigate();
const signOut=async()=>{ await supabase.auth.signOut(); nav("/"); };
return (
<div style={{padding:"1rem"}}>
<h1>Dashboard</h1>
<p>Logado como: <b>{email}</b></p>
<button onClick={signOut}>Sair</button>
<div style={{marginTop:16}}>
<h3>Placeholders</h3>
<ul>
<li>Listas e filtros virão na Fase 2.</li>
<li>Integração com DB será adicionada depois.</li>
</ul>
</div>
</div>
);
}