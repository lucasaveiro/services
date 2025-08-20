import { useEffect, useState } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProviderProfile from "./pages/ProviderProfile";
import Search from "./pages/Search";
import NewQuote from "./pages/NewQuote";
import MyQuotes from "./pages/MyQuotes";
import Protected from "./routes/Protected";

const Home = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Home</h1>
    <p className="text-gray-700">Marketplace de Serviços — MVP.</p>
  </div>
);

function Navbar({ session, isProvider }: { session: Session | null; isProvider: boolean }) {
  const nav = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    nav("/");
  };
  return (
    <nav className="flex items-center gap-3 px-3 py-2 border-b border-gray-300">
      <Link to="/" className="hover:underline">
        Home
      </Link>
      <Link to="/search" className="hover:underline">
        Buscar
      </Link>
      <Link to="/dashboard" className="hover:underline">
        Dashboard
      </Link>
      {isProvider ? (
        <Link to="/provider" className="hover:underline">
          Meu Perfil
        </Link>
      ) : (
        <>
          <Link to="/quotes/new" className="hover:underline">
            Novo Pedido
          </Link>
          <Link to="/quotes" className="hover:underline">
            Meus Pedidos
          </Link>
        </>
      )}
      <div className="ml-auto flex items-center gap-3">
        {session?.user?.email && (
          <span className="text-xs text-gray-600">{session.user.email}</span>
        )}
        {session ? (
          <button
            onClick={logout}
            className="px-2 py-1 text-sm text-white bg-blue-600 rounded"
          >
            Sair
          </button>
        ) : (
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isProvider, setIsProvider] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkProvider = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from("providers")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setIsProvider(!!data);
      } else {
        setIsProvider(false);
      }
    };
    checkProvider();
  }, [session]);

  return (
    <>
      <Navbar session={session} isProvider={isProvider} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard email={session?.user?.email || ""} />
            </Protected>
          }
        />
        <Route
          path="/provider"
          element={
            <Protected>
              {isProvider ? <ProviderProfile /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
        <Route path="/search" element={<Search />} />
        <Route
          path="/quotes/new"
          element={
            <Protected>
              {!isProvider ? <NewQuote /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
        <Route
          path="/quotes"
          element={
            <Protected>
              {!isProvider ? <MyQuotes /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

