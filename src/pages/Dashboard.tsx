import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Dashboard({ email }: { email: string }) {
  const nav = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    nav("/");
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>
        Logado como: <b>{email}</b>
      </p>
      <button
        onClick={signOut}
        className="mt-2 px-3 py-2 bg-blue-600 text-white rounded"
      >
        Sair
      </button>
      <div className="mt-4">
        <h3 className="font-semibold">Placeholders</h3>
        <ul className="list-disc list-inside">
          <li>Listas e filtros virão na Fase 2.</li>
          <li>Integração com DB será adicionada depois.</li>
        </ul>
      </div>
    </div>
  );
}
