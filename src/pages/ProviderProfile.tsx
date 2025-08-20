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
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
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
      const [provRes, catRes] = await Promise.all([
        supabase
          .from("providers")
          .select(
            "id, display_name, city, uf, hourly_rate, service_area_km, accepts_emergency, provider_categories(category_slug)"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("categories").select("slug, name"),
      ]);
      const { data, error } = provRes;
      if (error) {
        setMsg(error.message);
      }
      if (data) {
        const pc = (data as any).provider_categories as {
          category_slug: string;
        }[] | null;
        setSelectedCats(pc?.map((c) => c.category_slug) || []);
        const { provider_categories, ...rest } = data as any;
        setProv(rest as Provider);
      }
      if (catRes.error) {
        setMsg(catRes.error.message);
      }
      setCategories(catRes.data || []);
      setLoading(false);
    })();
  }, []);

  const disabled = useMemo(
    () =>
      !prov.display_name ||
      !prov.city ||
      !prov.uf ||
      prov.service_area_km === null,
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
    const slugs = selectedCats;
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
    <div className="max-w-xl mx-auto mt-6 p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-semibold">Meu Perfil de Prestador</h2>
      <div className="grid gap-2 mt-4">
        <input
          placeholder="Nome de exibição"
          value={prov.display_name}
          onChange={(e) =>
            setProv((p) => ({ ...p, display_name: e.target.value }))
          }
          className="p-2 border border-gray-300 rounded"
        />
        <div className="grid grid-cols-[1fr_100px] gap-2">
          <input
            placeholder="Cidade"
            value={prov.city}
            onChange={(e) => setProv((p) => ({ ...p, city: e.target.value }))}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            placeholder="UF"
            value={prov.uf}
            onChange={(e) =>
              setProv((p) => ({ ...p, uf: e.target.value.toUpperCase().slice(0, 2) }))
            }
            className="p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
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
            className="p-2 border border-gray-300 rounded"
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
            required
            min={0}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prov.accepts_emergency}
            onChange={(e) =>
              setProv((p) => ({ ...p, accepts_emergency: e.target.checked }))
            }
          />
          Atende emergências
        </label>
        <div>
          <p className="mt-2 mb-1">Categorias</p>
          <div className="flex flex-col gap-1">
            {categories.map((c) => (
              <label key={c.slug} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(c.slug)}
                  onChange={(e) =>
                    setSelectedCats((prev) =>
                      e.target.checked
                        ? [...prev, c.slug]
                        : prev.filter((s) => s !== c.slug)
                    )
                  }
                />
                {c.name || c.slug}
              </label>
            ))}
          </div>
        </div>
        <button
          disabled={disabled}
          onClick={save}
          className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Salvar
        </button>
        {msg && <p className="text-xs text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}

