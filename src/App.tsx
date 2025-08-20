import { useEffect, useState } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { getUserRole, type UserRole } from "./lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProviderProfile from "./pages/ProviderProfile";
import Search from "./pages/Search";
import NewQuote from "./pages/NewQuote";
import MyQuotes from "./pages/MyQuotes";
import ProviderLogin from "./pages/ProviderLogin";
import Home from "./pages/Home";
import Protected from "./routes/Protected";

function Navbar({
  session,
  role,
}: {
  session: Session | null;
  role: UserRole | null;
}) {
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
      {role !== "provider" && (
        <Link to="/search" className="hover:underline">
          Buscar
        </Link>
      )}
      {session && role === "provider" && (
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
      )}
      {session ? (
        role === "provider" ? (
          <Link to="/provider" className="hover:underline">
            Meu Perfil
          </Link>
        ) : role === "user" ? (
          <>
            <Link to="/quotes/new" className="hover:underline">
              Novo Pedido
            </Link>
            <Link to="/quotes" className="hover:underline">
              Meus Pedidos
            </Link>
          </>
        ) : (
          <Link to="/quotes/new" className="hover:underline">
            Novo Pedido
          </Link>
        )
      ) : (
        <Link to="/quotes/new" className="hover:underline">
          Novo Pedido
        </Link>
      )}
      <div className="ml-auto flex items-center gap-3">
        {!session && (
          <Link
            to="/provider/login"
            className="text-sm text-gray-600 hover:underline"
          >
            Seja um Pestador
          </Link>
        )}
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
  const [role, setRole] = useState<UserRole | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadRole = async () => {
      if (session?.user?.id) {
        const userRole = await getUserRole(session.user.id);
        setRole(userRole);
      } else {
        setRole(null);
      }
    };
    loadRole();
  }, [session]);

  return (
    <>
      <Navbar session={session} role={role} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              {role === "provider" ? (
                <Dashboard email={session?.user?.email || ""} />
              ) : (
                <Navigate to="/" replace />
              )}
            </Protected>
          }
        />
        <Route
          path="/provider"
          element={
            <Protected>
              {role === "provider" ? <ProviderProfile /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
        <Route
          path="/search"
          element={role !== "provider" ? <Search /> : <Navigate to="/" replace />} />
        <Route
          path="/quotes/new"
          element={
            <Protected>
              {role === "user" ? <NewQuote /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
        <Route
          path="/quotes"
          element={
            <Protected>
              {role === "user" ? <MyQuotes /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

