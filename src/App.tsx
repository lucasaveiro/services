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
  <div style={{ padding: "1rem" }}>
    <h1>Home</h1>
    <p>Marketplace de Serviços — MVP.</p>
  </div>
);

function Navbar({ session }: { session: Session | null }) {
  const nav = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    nav("/");
  };
  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        padding: "8px 12px",
        borderBottom: "1px solid #ddd",
        alignItems: "center",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/search">Buscar</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/provider">Meu Perfil</Link>
      <Link to="/quotes/new">Novo Pedido</Link>
      <Link to="/quotes">Meus Pedidos</Link>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        {session?.user?.email && (
          <span style={{ fontSize: 12, color: "#555" }}>
            {session.user.email}
          </span>
        )}
        {session ? (
          <button onClick={logout}>Sair</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Navbar session={session} />
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
              <ProviderProfile />
            </Protected>
          }
        />
        <Route path="/search" element={<Search />} />
        <Route
          path="/quotes/new"
          element={
            <Protected>
              <NewQuote />
            </Protected>
          }
        />
        <Route
          path="/quotes"
          element={
            <Protected>
              <MyQuotes />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

