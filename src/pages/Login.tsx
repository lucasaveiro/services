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
    <div className="max-w-md mx-auto mt-10 p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-semibold">Login</h2>
      <p className="text-gray-700">Receba um link mágico por e-mail.</p>
      <form onSubmit={onSubmit} className="grid gap-2 mt-4">
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {sending && <Spinner />} Enviar link de login
        </button>
      </form>
    </div>
  );
}

