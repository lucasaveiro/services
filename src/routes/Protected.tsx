import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Spinner from "../ui/Spinner";

export default function Protected({ children }:{ children:ReactNode }){
const [authed,setAuthed]=useState<boolean|null>(null);
useEffect(()=> {
supabase.auth.getSession().then(({data})=>setAuthed(!!data.session));
const { data:{ subscription } } = supabase.auth.onAuthStateChange((_e,s)=>setAuthed(!!s));
return ()=>subscription.unsubscribe();
},[]);
if(authed===null) return <div style={{display:"grid",placeItems:"center",padding:"2rem"}}><Spinner/></div>;
return authed ? <>{children}</> : <Navigate to="/login" replace/>;
}