import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Provider = {
  id?: string;
  user_id?: string;
  display_name: string;
  city: string;
  uf: string;
  hourly_rate: number | null;
  service_area_km: number | null;
  accepts_emergency: boolean;
};

export default function ProviderProfile() {
  const [uid, setUid] = useState<string>("");
  const [prov, setProv] = useState<Provider>({
    display_name: "",
    city: "",
    uf: "",
    hourly_rate: null,
    service_area_km: null,
    accepts_emergency: false,
  });
  const [catsStr, setCatsStr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUid(user.id);
      const { data, error } = await supabase
        .from("providers")
        .select(
          "id, display_name, city, uf, hourly_rate, service_area_km, accepts_emergency, provider_categories(category_slug)"
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        setMsg(error.message);
      }
      if (data) {
        const pc = (data as any).provider_categories as {
          category_slug: string;
        }[] | null;
        setCatsStr(pc?.map((c) => c.category_slug).join(",") || "");
        const { provider_categories, ...rest } = data as any;
        setProv(rest as Provider);
      }
      setLoading(false);
    })();
  }, []);

  const disabled = useMemo(
    () => !prov.display_name || !prov.city || !prov.uf,
    [prov]
  );

  const save = async () => {
    setMsg("Salvando...");
    // upsert provider by unique user_id
    const payload = { ...prov, user_id: uid };
    const { data: up, error } = await supabase
      .from("providers")
      .upsert(payload, { onConflict: "user_id" })
      .select("id")
      .single();
    if (error) {
      setMsg(`Erro: ${error.message}`);
      return;
    }
    const provider_id = up.id as string;

    // sync categories
    const slugs = catsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await supabase
      .from("provider_categories")
      .delete()
      .eq("provider_id", provider_id);
    if (slugs.length) {
      await supabase
        .from("provider_categories")
        .insert(slugs.map((category_slug) => ({ provider_id, category_slug })));
    }
    setMsg("Salvo.");
  };

  if (loading) return null;

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "24px auto",
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Meu Perfil de Prestador</h2>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="Nome de exibição"
          value={prov.display_name}
          onChange={(e) =>
            setProv((p) => ({ ...p, display_name: e.target.value }))
          }
        />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 8 }}
        >
          <input
            placeholder="Cidade"
            value={prov.city}
            onChange={(e) => setProv((p) => ({ ...p, city: e.target.value }))}
          />
          <input
            placeholder="UF"
            value={prov.uf}
            onChange={(e) =>
              setProv((p) => ({ ...p, uf: e.target.value.toUpperCase().slice(0, 2) }))
            }
          />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <input
            type="number"
            placeholder="Preço/hora"
            value={prov.hourly_rate ?? ""}
            onChange={(e) =>
              setProv((p) => ({
                ...p,
                hourly_rate: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
          <input
            type="number"
            placeholder="Área de atendimento (km)"
            value={prov.service_area_km ?? ""}
            onChange={(e) =>
              setProv((p) => ({
                ...p,
                service_area_km: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={prov.accepts_emergency}
            onChange={(e) =>
              setProv((p) => ({ ...p, accepts_emergency: e.target.checked }))
            }
          />
          Atende emergências
        </label>
        <input
          placeholder="Categorias (slugs, separadas por vírgula)"
          value={catsStr}
          onChange={(e) => setCatsStr(e.target.value)}
        />
        <button disabled={disabled} onClick={save}>
          Salvar
        </button>
        {msg && <p style={{ fontSize: 12, color: "#555" }}>{msg}</p>}
      </div>
    </div>
  );
}

