export function createSupaClient(url, key) {
  const base = url.replace(/\/+$/, "");
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  return {
    async select(table, query = "") {
      const r = await fetch(`${base}/rest/v1/${table}?${query}`, { headers });
      if (!r.ok) throw new Error(`Select ${table}: ${r.status}`);
      return r.json();
    },

    async insert(table, data) {
      const r = await fetch(`${base}/rest/v1/${table}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!r.ok) {
        const e = await r.text();
        throw new Error(`Insert ${table}: ${r.status} ${e}`);
      }
      return r.json();
    },

    async update(table, match, data) {
      const params = Object.entries(match)
        .map(([k, v]) => `${k}=eq.${v}`)
        .join("&");
      const r = await fetch(`${base}/rest/v1/${table}?${params}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(`Update ${table}: ${r.status}`);
      return r.json();
    },

    async delete(table, match) {
      const params = Object.entries(match)
        .map(([k, v]) => `${k}=eq.${v}`)
        .join("&");
      const r = await fetch(`${base}/rest/v1/${table}?${params}`, {
        method: "DELETE",
        headers,
      });
      if (!r.ok) throw new Error(`Delete ${table}: ${r.status}`);
      return true;
    },
  };
}
