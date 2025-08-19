import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";
import Spinner from "../ui/Spinner";
import { toastSuccess, toastError } from "../ui/toast";

const isEmail = (v: string) => /.+@.+\..+/.test(v);

export default function Login() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !isEmail(email)) {
      toastError("E-mail inválido.");
      return;
    }
    setSending(true);
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    if (error) toastError(error.message);
    else {
      toastSuccess("Link enviado! Verifique seu e-mail.");
      setEmail("");
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: "16px",
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Login</h2>
      <p>Receba um link mágico por e-mail.</p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
        <button
          disabled={sending}
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {sending && <Spinner />} Enviar link de login
        </button>
      </form>
    </div>
  );
}

