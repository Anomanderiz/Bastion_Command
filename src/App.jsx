import { useState, useEffect, useCallback } from "react";
import { db } from "./supabase.js";
import {
  CLASSES, AVATAR_COLORS, SIZES, BASIC_FACILITIES, ORDER_TYPES,
  SET_LABELS, SET_COLORS, SPECIAL_FACILITIES,
  GARDEN_TYPES, PUB_BEVERAGES, TRAINING_TYPES, GUILD_TYPES,
  MANIFEST_PLANES, MUSEUM_CHARMS, ARCHIVE_BOOKS, WORKSHOP_TOOLS_OPTIONS,
  getMaxSpecialFacilities,
} from "./data.js";

// ─── SMALL COMPONENTS ───────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div style={{
        width: 28, height: 28,
        border: "3px solid var(--border)", borderTopColor: "var(--gold)",
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fade-in" style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: "var(--bg-card)", border: "1px solid var(--gold-dim)",
      padding: "10px 24px", borderRadius: 6, zIndex: 999, fontSize: 14, color: "var(--gold)",
    }}>{message}</div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 20, overflowX: "auto" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          border: "none",
          borderBottom: active === t.key ? "2px solid var(--gold)" : "2px solid transparent",
          background: "none",
          color: active === t.key ? "var(--gold)" : "var(--text-dim)",
          padding: "10px 20px", borderRadius: 0, textTransform: "uppercase",
          fontSize: 12, letterSpacing: 1, whiteSpace: "nowrap",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function FacilityCard({ fac, onAdd, added, disabled }) {
  const [open, setOpen] = useState(false);
  const setColor = SET_COLORS[fac.set];
  return (
    <div className="card fade-in" style={{ opacity: disabled ? 0.5 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <h4 style={{ fontSize: 16, margin: 0 }}>{fac.name}</h4>
            <span className="badge" style={{ background: setColor + "22", color: setColor, border: `1px solid ${setColor}44` }}>{SET_LABELS[fac.set]}</span>
            <span className="badge" style={{ background: "var(--bg-deep)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>Lvl {fac.level}</span>
            <span className="badge" style={{ background: "var(--bg-deep)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>{fac.order}</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "4px 0" }}>{fac.desc}</p>
          {fac.prereq && <p style={{ fontSize: 12, color: "var(--crimson-bright)", marginTop: 4 }}>Requires: {fac.prereq}</p>}
          <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
            {SIZES[fac.space].label} · {fac.hirelings} hireling{fac.hirelings > 1 ? "s" : ""}
            {fac.multi ? " · Can have multiple" : ""}{fac.enlarge ? " · Enlargeable" : ""}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          {onAdd && (
            <button className="primary" onClick={() => onAdd(fac)} disabled={disabled || added}
              style={{ fontSize: 11, padding: "6px 14px", whiteSpace: "nowrap" }}>
              {added ? "✓ Added" : "Add"}
            </button>
          )}
        </div>
      </div>
      <button onClick={() => setOpen(!open)} style={{
        background: "none", border: "none", color: "var(--gold-dim)", fontSize: 12,
        padding: "4px 0", marginTop: 8, textTransform: "none", letterSpacing: 0,
      }}>
        {open ? "▾ Hide details" : "▸ Show details"}
      </button>
      {open && (
        <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, color: "var(--text)" }}>
          {fac.benefits.map((b, i) => <li key={i} style={{ marginBottom: 3 }}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

// ─── PARTY SCREEN ───────────────────────────────────────────────

function PartyScreen({ db, clientId, onJoin }) {
  const [mode, setMode] = useState(null);
  const [partyName, setPartyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [charName, setCharName] = useState("");
  const [charClass, setCharClass] = useState("Fighter");
  const [charLevel, setCharLevel] = useState(5);
  const [isDM, setIsDM] = useState(false);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const players = await db.select("players", `client_id=eq.${clientId}&select=*,parties:party_id(*)`);
        if (players.length > 0) {
          onJoin(players[0].parties, players[0]);
          return;
        }
      } catch { /* no existing player */ }
      setLoading(false);
    })();
  }, []);

  async function handleCreate() {
    setError("");
    if (!partyName || !charName) { setError("Fill in all fields"); return; }
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const [party] = await db.insert("parties", { name: partyName, join_code: code, dm_client_id: isDM ? clientId : null });
      const [player] = await db.insert("players", {
        party_id: party.id, client_id: clientId, character_name: charName,
        character_class: charClass, character_level: charLevel, is_dm: isDM, avatar_color: color,
      });
      onJoin(party, player);
    } catch (e) { setError("Failed to create party: " + e.message); }
  }

  async function handleJoin() {
    setError("");
    if (!joinCode || !charName) { setError("Fill in all fields"); return; }
    try {
      const parties = await db.select("parties", `join_code=eq.${joinCode.toUpperCase()}`);
      if (!parties.length) { setError("No party found with that code"); return; }
      const party = parties[0];
      const [player] = await db.insert("players", {
        party_id: party.id, client_id: clientId, character_name: charName,
        character_class: charClass, character_level: charLevel, is_dm: isDM, avatar_color: color,
      });
      onJoin(party, player);
    } catch (e) { setError("Failed to join: " + e.message); }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 20px" }} className="fade-in">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>⚔ Bastion Manager</h1>
        <p style={{ color: "var(--text-dim)" }}>Create or join a party</p>
      </div>
      {!mode ? (
        <div style={{ display: "flex", gap: 16 }}>
          <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => setMode("create")}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Create Party</h3>
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Start a new campaign and invite your players</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => setMode("join")}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Join Party</h3>
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Enter a code to join an existing party</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button onClick={() => setMode(null)} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 13, padding: 0, textAlign: "left", textTransform: "none" }}>← Back</button>
          {mode === "create" && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Party Name</label>
              <input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="The Swords of Waterdeep" style={{ width: "100%", marginTop: 4 }} />
            </div>
          )}
          {mode === "join" && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Join Code</label>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="ABC123" style={{ width: "100%", marginTop: 4, textTransform: "uppercase" }} maxLength={6} />
            </div>
          )}
          <div className="divider" />
          <h4 style={{ fontSize: 14 }}>Your Character</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Name</label>
              <input value={charName} onChange={e => setCharName(e.target.value)} placeholder="Kira" style={{ width: "100%", marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Class</label>
              <select value={charClass} onChange={e => setCharClass(e.target.value)} style={{ width: "100%", marginTop: 4 }}>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Level</label>
              <input type="number" min={1} max={20} value={charLevel} onChange={e => setCharLevel(parseInt(e.target.value) || 1)} style={{ width: "100%", marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Role</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={() => setIsDM(false)} style={{ flex: 1, fontSize: 11, padding: "8px", background: !isDM ? "var(--border-gold)" : "var(--bg-input)", border: !isDM ? "1px solid var(--gold)" : "1px solid var(--border)" }}>Player</button>
                <button onClick={() => setIsDM(true)} style={{ flex: 1, fontSize: 11, padding: "8px", background: isDM ? "var(--border-gold)" : "var(--bg-input)", border: isDM ? "1px solid var(--gold)" : "1px solid var(--border)" }}>DM</button>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Color</label>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {AVATAR_COLORS.map(c => (
                <div key={c} onClick={() => setColor(c)} style={{
                  width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                  border: color === c ? "2px solid var(--text-bright)" : "2px solid transparent",
                }} />
              ))}
            </div>
          </div>
          {error && <p style={{ color: "var(--crimson-bright)", fontSize: 13 }}>{error}</p>}
          <button className="primary" onClick={mode === "create" ? handleCreate : handleJoin} style={{ width: "100%", padding: 12, marginTop: 4 }}>
            {mode === "create" ? "Create Party" : "Join Party"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CREATE BASTION FORM ────────────────────────────────────────

function CreateBastionForm({ onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="card" style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
      <h3 style={{ marginBottom: 16 }}>Establish Your Bastion</h3>
      <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20 }}>
        Name your stronghold and describe what form it takes — a tower, a shrine, a hidden cellar, a fortified keep...
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Bastion Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="The Ember Sanctum" style={{ width: "100%", marginTop: 4 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="A converted watchtower overlooking the harbor..." style={{ width: "100%", marginTop: 4, minHeight: 60, resize: "vertical" }} />
        </div>
        <button className="primary" onClick={() => onCreate(name, desc)} disabled={!name} style={{ width: "100%", padding: 12 }}>Establish Bastion</button>
      </div>
    </div>
  );
}

// ─── BASTION VIEW ───────────────────────────────────────────────

function BastionView({ bastion, facilities, defenders, hirelings, player, onRemoveFacility, onAddDefender, onAddHireling }) {
  const [newDefName, setNewDefName] = useState("");
  const [defFacility, setDefFacility] = useState("");
  const [showHireForm, setShowHireForm] = useState(null);
  const [hireName, setHireName] = useState("");
  const [hireRole, setHireRole] = useState("");

  const specialFacs = facilities.filter(f => f.facility_type === "special");
  const basicFacs = facilities.filter(f => f.facility_type === "basic");
  const aliveDefenders = defenders.filter(d => d.is_alive);
  const barracks = facilities.filter(f => f.facility_key === "barrack");
  const maxSpecial = getMaxSpecialFacilities(player.character_level);

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, background: "linear-gradient(135deg, var(--bg-card) 0%, #2A2418 100%)", borderColor: "var(--border-gold)" }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>{bastion.name}</h2>
        {bastion.description && <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 12 }}>{bastion.description}</p>}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13 }}>
          <span>Special Facilities: <strong style={{ color: "var(--gold)" }}>{specialFacs.length}/{maxSpecial}</strong></span>
          <span>Basic Facilities: <strong style={{ color: "var(--text)" }}>{basicFacs.length}</strong></span>
          <span>Defenders: <strong style={{ color: aliveDefenders.length > 0 ? "var(--green)" : "var(--crimson-bright)" }}>{aliveDefenders.length}</strong></span>
          <span>Walls: <strong>{bastion.defensive_wall_squares || 0}</strong> sq{bastion.walls_fully_enclosed ? " (enclosed)" : ""}</span>
        </div>
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Special Facilities</h3>
      {specialFacs.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 16 }}>No special facilities yet. Go to "Add Facilities" to choose your first.</p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {specialFacs.map(f => {
            const def = SPECIAL_FACILITIES.find(sf => sf.key === f.facility_key);
            const facHirelings = hirelings.filter(h => h.facility_id === f.id);
            return (
              <div key={f.id} className="card" style={{ borderLeft: `3px solid ${def ? SET_COLORS[def.set] : "var(--gold)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <h4 style={{ fontSize: 15, margin: 0 }}>{def?.name || f.facility_key}</h4>
                      <span className="badge" style={{ background: "var(--bg-deep)", color: "var(--text-dim)", border: "1px solid var(--border)", fontSize: 10 }}>
                        {SIZES[f.size].label} · {SIZES[f.size].squares} sq
                      </span>
                      {def && <span className="badge" style={{ background: "var(--bg-deep)", color: "var(--text-dim)", border: "1px solid var(--border)", fontSize: 10 }}>{def.order}</span>}
                    </div>
                    {def && <p style={{ fontSize: 13, color: "var(--text-dim)" }}>{def.desc}</p>}
                    {f.garden_type && <p style={{ fontSize: 12, color: "var(--green)" }}>Type: {f.garden_type}</p>}
                    {f.pub_beverage && <p style={{ fontSize: 12, color: "var(--blue)" }}>Beverage: {f.pub_beverage}</p>}
                    {f.training_type && <p style={{ fontSize: 12, color: "var(--blue)" }}>Trainer: {f.training_type}</p>}
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase" }}>
                        Hirelings ({facHirelings.length}/{def?.hirelings || "?"}):
                      </span>{" "}
                      {facHirelings.map(h => (
                        <span key={h.id} style={{ fontSize: 12, color: "var(--text)", marginRight: 8 }}>
                          {h.name}{h.role ? ` (${h.role})` : ""}
                        </span>
                      ))}
                      {facHirelings.length < (def?.hirelings || 1) && (
                        showHireForm === f.id ? (
                          <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                            <input value={hireName} onChange={e => setHireName(e.target.value)} placeholder="Name" style={{ width: 90, padding: "2px 6px", fontSize: 12 }} />
                            <input value={hireRole} onChange={e => setHireRole(e.target.value)} placeholder="Role" style={{ width: 70, padding: "2px 6px", fontSize: 12 }} />
                            <button onClick={() => { onAddHireling(f.id, hireName || "Unnamed", hireRole); setShowHireForm(null); setHireName(""); setHireRole(""); }}
                              style={{ fontSize: 10, padding: "2px 6px" }}>+</button>
                          </span>
                        ) : (
                          <button onClick={() => setShowHireForm(f.id)}
                            style={{ fontSize: 10, padding: "2px 6px", background: "none", border: "1px solid var(--border)", color: "var(--text-dim)" }}>+ Add</button>
                        )
                      )}
                    </div>
                  </div>
                  <button className="danger" onClick={() => onRemoveFacility(f.id)} style={{ fontSize: 10, padding: "4px 10px" }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Basic Facilities</h3>
      {basicFacs.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 16 }}>No basic facilities yet.</p>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {basicFacs.map(f => (
            <div key={f.id} className="card" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, textTransform: "capitalize" }}>{f.facility_key.replace(/_/g, " ")}</span>
              <span style={{ fontSize: 11, color: "var(--text-dim)" }}>({SIZES[f.size].label})</span>
              <button className="danger" onClick={() => onRemoveFacility(f.id)} style={{ fontSize: 9, padding: "2px 6px", marginLeft: 4 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Bastion Defenders ({aliveDefenders.length})</h3>
      <div className="card" style={{ marginBottom: 20 }}>
        {aliveDefenders.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: 13 }}>No defenders. Build a Barrack and recruit some.</p>}
        {aliveDefenders.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {aliveDefenders.map(d => (
              <span key={d.id} style={{ fontSize: 12, padding: "3px 10px", background: "var(--bg-deep)", border: "1px solid var(--border)", borderRadius: 3 }}>
                {d.name}{d.creature_type ? ` (${d.creature_type})` : ""}
              </span>
            ))}
          </div>
        )}
        {barracks.length > 0 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input value={newDefName} onChange={e => setNewDefName(e.target.value)} placeholder="Defender name" style={{ padding: "4px 8px", fontSize: 12, width: 160 }} />
            <select value={defFacility} onChange={e => setDefFacility(e.target.value)} style={{ padding: "4px 8px", fontSize: 12 }}>
              <option value="">Select barrack...</option>
              {barracks.map(b => <option key={b.id} value={b.id}>Barrack ({SIZES[b.size].label})</option>)}
            </select>
            <button onClick={() => { if (newDefName && defFacility) { onAddDefender(newDefName, defFacility); setNewDefName(""); } }}
              disabled={!newDefName || !defFacility} style={{ fontSize: 10, padding: "4px 10px" }}>Recruit</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FACILITY BROWSER ───────────────────────────────────────────

function FacilityBrowser({ level, currentFacilities, maxSpecial, currentSpecialCount, onAdd, onAddBasic }) {
  const [filterSet, setFilterSet] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterOrder, setFilterOrder] = useState("all");
  const [search, setSearch] = useState("");
  const [basicSize, setBasicSize] = useState("roomy");

  const currentKeys = currentFacilities.filter(f => f.facility_type === "special").map(f => f.facility_key);
  const atCap = currentSpecialCount >= maxSpecial;

  const filtered = SPECIAL_FACILITIES.filter(f => {
    if (filterSet !== "all" && f.set !== filterSet) return false;
    if (filterLevel !== "all" && f.level !== parseInt(filterLevel)) return false;
    if (filterOrder !== "all" && f.order !== filterOrder) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 14 }}>Special: <strong style={{ color: atCap ? "var(--crimson-bright)" : "var(--gold)" }}>{currentSpecialCount}/{maxSpecial}</strong> slots</span>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Level {level} · Next slots at {level < 9 ? "9" : level < 13 ? "13" : level < 17 ? "17" : "max"}</span>
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, marginBottom: 10 }}>Basic Facilities</h4>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>No game effects — add for RP and verisimilitude.</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {BASIC_FACILITIES.map(bf => (
            <button key={bf} onClick={() => onAddBasic(bf, basicSize)} style={{ fontSize: 11, padding: "6px 12px" }}>{bf}</button>
          ))}
          <select value={basicSize} onChange={e => setBasicSize(e.target.value)} style={{ fontSize: 11, padding: "4px 8px" }}>
            <option value="cramped">Cramped (500 GP, 20d)</option>
            <option value="roomy">Roomy (1,000 GP, 45d)</option>
            <option value="vast">Vast (3,000 GP, 125d)</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search facilities..." style={{ flex: "1 1 180px", padding: "6px 10px", fontSize: 13 }} />
        <select value={filterSet} onChange={e => setFilterSet(e.target.value)} style={{ fontSize: 12, padding: "6px 8px" }}>
          <option value="all">All Sets</option>
          <option value="core">Core</option>
          <option value="fr">Forgotten Realms</option>
          <option value="eberron">Eberron</option>
        </select>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ fontSize: 12, padding: "6px 8px" }}>
          <option value="all">All Levels</option>
          <option value="5">Level 5</option><option value="9">Level 9</option>
          <option value="13">Level 13</option><option value="17">Level 17</option>
        </select>
        <select value={filterOrder} onChange={e => setFilterOrder(e.target.value)} style={{ fontSize: 12, padding: "6px 8px" }}>
          <option value="all">All Orders</option>
          {ORDER_TYPES.filter(o => o !== "Maintain").map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>{filtered.length} facilities shown</p>
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map(fac => {
          const alreadyAdded = !fac.multi && currentKeys.includes(fac.key);
          const tooHighLevel = fac.level > level;
          const disabled = (atCap && !alreadyAdded) || tooHighLevel;
          return (
            <FacilityCard key={fac.key} fac={fac} added={alreadyAdded} disabled={disabled}
              onAdd={(f) => {
                const options = {};
                if (f.hasOptions === "garden_type") options.garden_type = GARDEN_TYPES[0];
                if (f.hasOptions === "pub_beverage") options.pub_beverage = PUB_BEVERAGES[0];
                if (f.hasOptions === "training_type") options.training_type = TRAINING_TYPES[0];
                if (f.hasOptions === "guild_type") options.guild_type = GUILD_TYPES[0];
                if (f.hasOptions === "manifest_plane") options.manifest_plane = MANIFEST_PLANES[0];
                if (f.hasOptions === "museum_charm") options.museum_charm = MUSEUM_CHARMS[0];
                onAdd(f, options);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────

function Dashboard({ db, party, player: initialPlayer }) {
  const [tab, setTab] = useState("bastion");
  const [bastion, setBastion] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [defenders, setDefenders] = useState([]);
  const [hirelingList, setHirelings] = useState([]);
  const [partyMembers, setPartyMembers] = useState([]);
  const [partyBastions, setPartyBastions] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [player, setPlayer] = useState(initialPlayer);
  const [editingLevel, setEditingLevel] = useState(false);
  const [tempLevel, setTempLevel] = useState(player.character_level);

  const showToast = useCallback((msg) => setToast(msg), []);

  const loadData = useCallback(async () => {
    try {
      const bastions = await db.select("bastions", `player_id=eq.${player.id}`);
      if (bastions.length > 0) {
        setBastion(bastions[0]);
        const facs = await db.select("facilities", `bastion_id=eq.${bastions[0].id}&order=created_at.asc`);
        setFacilities(facs);
        const defs = await db.select("defenders", `bastion_id=eq.${bastions[0].id}&order=created_at.asc`);
        setDefenders(defs);
        const facIds = facs.map(f => f.id);
        if (facIds.length > 0) {
          const hirs = await db.select("hirelings", `facility_id=in.(${facIds.join(",")})&order=created_at.asc`);
          setHirelings(hirs);
        } else {
          setHirelings([]);
        }
      }
      const members = await db.select("players", `party_id=eq.${party.id}&order=created_at.asc`);
      setPartyMembers(members);
      const allBastions = {};
      for (const m of members) {
        const b = await db.select("bastions", `player_id=eq.${m.id}`);
        if (b.length) {
          const f = await db.select("facilities", `bastion_id=eq.${b[0].id}&order=created_at.asc`);
          allBastions[m.id] = { bastion: b[0], facilities: f };
        }
      }
      setPartyBastions(allBastions);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [db, player.id, party.id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function createBastion(name, desc) {
    const [b] = await db.insert("bastions", { player_id: player.id, name, description: desc });
    setBastion(b); showToast("Bastion created!"); loadData();
  }

  async function addFacility(facilityKey, type, size, options = {}) {
    await db.insert("facilities", { bastion_id: bastion.id, facility_key: facilityKey, facility_type: type, size, ...options });
    showToast("Facility added!"); loadData();
  }

  async function removeFacility(facId) {
    await db.delete("facilities", { id: facId }); showToast("Facility removed"); loadData();
  }

  async function addDefender(name, facilityId) {
    await db.insert("defenders", { bastion_id: bastion.id, facility_id: facilityId, name });
    showToast("Defender recruited!"); loadData();
  }

  async function addHireling(facilityId, name, role) {
    await db.insert("hirelings", { facility_id: facilityId, name, role });
    showToast("Hireling added!"); loadData();
  }

  async function updateLevel(newLevel) {
    await db.update("players", { id: player.id }, { character_level: newLevel });
    setPlayer(prev => ({ ...prev, character_level: newLevel }));
    setEditingLevel(false); showToast(`Level updated to ${newLevel}`); loadData();
  }

  if (loading) return <Spinner />;

  const maxSpecial = getMaxSpecialFacilities(player.character_level);
  const currentSpecialCount = facilities.filter(f => f.facility_type === "special").length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, letterSpacing: 1.5 }}>⚔ {party.name}</h1>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>
            Code: <span style={{ color: "var(--gold)", fontFamily: "monospace", letterSpacing: 2 }}>{party.join_code}</span>
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: player.avatar_color }} />
            <span style={{ fontFamily: "Cinzel", fontSize: 14, color: "var(--gold)" }}>{player.character_name}</span>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{player.character_class}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            {editingLevel ? (
              <>
                <span>Lvl</span>
                <input type="number" min={1} max={20} value={tempLevel} onChange={e => setTempLevel(parseInt(e.target.value) || 1)} style={{ width: 50, padding: "2px 6px", fontSize: 12 }} />
                <button onClick={() => updateLevel(tempLevel)} style={{ fontSize: 10, padding: "2px 8px" }}>Save</button>
                <button onClick={() => setEditingLevel(false)} style={{ fontSize: 10, padding: "2px 8px", border: "none", background: "none", color: "var(--text-dim)" }}>✕</button>
              </>
            ) : (
              <span onClick={() => { setEditingLevel(true); setTempLevel(player.character_level); }} style={{ cursor: "pointer" }} title="Click to change level">
                Level {player.character_level}{player.is_dm ? " · DM" : ""} ✎
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs tabs={[
        { key: "bastion", label: "My Bastion" },
        { key: "facilities", label: "Add Facilities" },
        { key: "party", label: `Party (${partyMembers.length})` },
      ]} active={tab} onChange={setTab} />

      {tab === "bastion" && (
        <div className="fade-in">
          {!bastion ? (
            <CreateBastionForm onCreate={createBastion} />
          ) : (
            <BastionView bastion={bastion} facilities={facilities} defenders={defenders}
              hirelings={hirelingList} player={player} onRemoveFacility={removeFacility}
              onAddDefender={addDefender} onAddHireling={addHireling} />
          )}
        </div>
      )}

      {tab === "facilities" && (
        <div className="fade-in">
          {!bastion ? (
            <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>Create your Bastion first.</p>
          ) : (
            <FacilityBrowser level={player.character_level} currentFacilities={facilities}
              maxSpecial={maxSpecial} currentSpecialCount={currentSpecialCount}
              onAdd={(fac, options) => addFacility(fac.key, "special", fac.space, options)}
              onAddBasic={(name, size) => addFacility(name.toLowerCase().replace(/ /g, "_"), "basic", size)} />
          )}
        </div>
      )}

      {tab === "party" && (
        <div className="fade-in">
          <div style={{ display: "grid", gap: 16 }}>
            {partyMembers.map(m => {
              const pb = partyBastions[m.id];
              return (
                <div key={m.id} className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: m.avatar_color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Cinzel", fontSize: 16, color: "var(--bg-deep)", fontWeight: 700,
                    }}>{m.character_name[0]}</div>
                    <div>
                      <h4 style={{ fontSize: 15, margin: 0 }}>{m.character_name}</h4>
                      <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
                        {m.character_class} · Level {m.character_level}{m.is_dm ? " · DM" : ""}
                      </p>
                    </div>
                  </div>
                  {pb ? (
                    <div>
                      <p style={{ fontSize: 14 }}>
                        <strong style={{ color: "var(--gold)" }}>{pb.bastion.name}</strong>
                        {pb.bastion.description ? ` — ${pb.bastion.description}` : ""}
                      </p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        {pb.facilities.filter(f => f.facility_type === "special").map(f => {
                          const facDef = SPECIAL_FACILITIES.find(sf => sf.key === f.facility_key);
                          return <span key={f.id} className="badge" style={{ background: "var(--bg-deep)", color: "var(--gold)", border: "1px solid var(--border-gold)", fontSize: 11 }}>{facDef?.name || f.facility_key}</span>;
                        })}
                        {pb.facilities.filter(f => f.facility_type === "basic").map(f => (
                          <span key={f.id} className="badge" style={{ background: "var(--bg-deep)", color: "var(--text-dim)", border: "1px solid var(--border)", fontSize: 11 }}>
                            {f.custom_name || f.facility_key.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>No bastion yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────

export default function App() {
  const [clientId, setClientId] = useState(null);
  const [party, setParty] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cid = localStorage.getItem("bastion_client_id");
    if (!cid) {
      cid = crypto.randomUUID();
      localStorage.setItem("bastion_client_id", cid);
    }
    setClientId(cid);
    setLoading(false);
  }, []);

  function handleJoin(partyData, playerData) {
    setParty(partyData);
    setPlayer(playerData);
  }

  if (loading) return <Spinner />;

  return (
    <>
      {!party ? <PartyScreen db={db} clientId={clientId} onJoin={handleJoin} /> :
       <Dashboard db={db} party={party} player={player} />}
    </>
  );
}
