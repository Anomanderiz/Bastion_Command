import { useState, useEffect, useCallback } from “react”;
import { db } from “./supabase.js”;
import TurnManager from “./TurnManager.jsx”;
import {
sendToDiscord, msgBastionCreated, msgFacilityAdded,
msgFacilityRemoved, msgDefenderRecruited, msgPlayerRemoved,
} from “./discord.js”;
import {
CLASSES, AVATAR_COLORS, SIZES, BASIC_FACILITIES, ORDER_TYPES,
SET_LABELS, SET_COLORS, SPECIAL_FACILITIES,
GARDEN_TYPES, PUB_BEVERAGES, TRAINING_TYPES, GUILD_TYPES,
MANIFEST_PLANES, MUSEUM_CHARMS, ARCHIVE_BOOKS, WORKSHOP_TOOLS_OPTIONS,
getMaxSpecialFacilities, ORDER_OPTIONS, ENLARGE_COST, getBarrackCapacity,
} from “./data.js”;

const DM_PASSWORD = “Blackstaff”;

function Spinner() {
return (
<div style={{ display: “flex”, justifyContent: “center”, padding: 40 }}>
<div style={{ width: 28, height: 28, border: “3px solid var(–border)”, borderTopColor: “var(–gold)”, borderRadius: “50%”, animation: “spin 0.8s linear infinite” }} />
</div>
);
}

function Toast({ message, onClose }) {
useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
return <div className=“fade-in” style={{ position: “fixed”, bottom: 20, left: “50%”, transform: “translateX(-50%)”, background: “var(–bg-card)”, border: “1px solid var(–gold-dim)”, padding: “10px 24px”, borderRadius: 6, zIndex: 999, fontSize: 14, color: “var(–gold)” }}>{message}</div>;
}

function Tabs({ tabs, active, onChange }) {
return (
<div style={{ display: “flex”, gap: 0, borderBottom: “1px solid var(–border)”, marginBottom: 20, overflowX: “auto” }}>
{tabs.map(t => (
<button key={t.key} onClick={() => onChange(t.key)} style={{ border: “none”, borderBottom: active === t.key ? “2px solid var(–gold)” : “2px solid transparent”, background: “none”, color: active === t.key ? “var(–gold)” : “var(–text-dim)”, padding: “10px 20px”, borderRadius: 0, textTransform: “uppercase”, fontSize: 12, letterSpacing: 1, whiteSpace: “nowrap” }}>{t.label}</button>
))}
</div>
);
}

function FacilityCard({ fac, onAdd, added, disabled }) {
const [open, setOpen] = useState(false);
const setColor = SET_COLORS[fac.set];
return (
<div className=“card fade-in” style={{ opacity: disabled ? 0.5 : 1 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, gap: 12 }}>
<div style={{ flex: 1 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8, flexWrap: “wrap”, marginBottom: 4 }}>
<h4 style={{ fontSize: 16, margin: 0 }}>{fac.name}</h4>
<span className=“badge” style={{ background: setColor + “22”, color: setColor, border: “1px solid “ + setColor + “44” }}>{SET_LABELS[fac.set]}</span>
<span className=“badge” style={{ background: “var(–bg-deep)”, color: “var(–text-dim)”, border: “1px solid var(–border)” }}>Lvl {fac.level}</span>
<span className=“badge” style={{ background: “var(–bg-deep)”, color: “var(–text-dim)”, border: “1px solid var(–border)” }}>{fac.order}</span>
</div>
<p style={{ fontSize: 14, color: “var(–text-dim)”, margin: “4px 0” }}>{fac.desc}</p>
{fac.prereq && <p style={{ fontSize: 12, color: “var(–crimson-bright)”, marginTop: 4 }}>Requires: {fac.prereq}</p>}
<p style={{ fontSize: 12, color: “var(–text-dim)”, marginTop: 2 }}>{SIZES[fac.space].label} · {fac.hirelings} hireling{fac.hirelings > 1 ? “s” : “”}{fac.multi ? “ · Can have multiple” : “”}{fac.enlarge ? “ · Enlargeable” : “”}</p>
</div>
{onAdd && <button className=“primary” onClick={() => onAdd(fac)} disabled={disabled || added} style={{ fontSize: 11, padding: “6px 14px”, whiteSpace: “nowrap” }}>{added ? “✓ Added” : “Add”}</button>}
</div>
<button onClick={() => setOpen(!open)} style={{ background: “none”, border: “none”, color: “var(–gold-dim)”, fontSize: 12, padding: “4px 0”, marginTop: 8, textTransform: “none”, letterSpacing: 0 }}>{open ? “▾ Hide details” : “▸ Show details”}</button>
{open && <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, color: “var(–text)” }}>{fac.benefits.map((b, i) => <li key={i} style={{ marginBottom: 3 }}>{b}</li>)}</ul>}
</div>
);
}

// ─── LOGIN SCREEN ───────────────────────────────────────────────

function LoginScreen({ onLogin }) {
const [role, setRole] = useState(null);
const [password, setPassword] = useState(””);
const [error, setError] = useState(””);
// DM state
const [dmAuthed, setDmAuthed] = useState(false);
const [allParties, setAllParties] = useState([]);
const [loadingParties, setLoadingParties] = useState(false);
const [creatingParty, setCreatingParty] = useState(false);
const [partyName, setPartyName] = useState(””);
// Player state
const [playerJoinCode, setPlayerJoinCode] = useState(””);
const [playerParty, setPlayerParty] = useState(null);
const [partyPlayers, setPartyPlayers] = useState([]);
const [loadingPlayers, setLoadingPlayers] = useState(false);
const [creatingChar, setCreatingChar] = useState(false);
const [charName, setCharName] = useState(””);
const [charClass, setCharClass] = useState(“Fighter”);
const [charLevel, setCharLevel] = useState(5);
const [color, setColor] = useState(AVATAR_COLORS[0]);

// DM: load all parties when password is correct
async function loadParties() {
setLoadingParties(true);
try {
const parties = await db.select(“parties”, “order=created_at.desc”);
setAllParties(parties);
} catch { setAllParties([]); }
setLoadingParties(false);
}

function handlePasswordSubmit() {
setError(””);
if (password !== DM_PASSWORD) { setError(“Incorrect password.”); return; }
setDmAuthed(true);
loadParties();
}

async function handleCreateParty() {
setError(””);
if (!partyName) { setError(“Enter a party name.”); return; }
try {
const code = Math.random().toString(36).substring(2, 8).toUpperCase();
const [party] = await db.insert(“parties”, { name: partyName, join_code: code });
localStorage.setItem(“bastion_session”, JSON.stringify({ role: “dm”, partyId: party.id }));
onLogin(“dm”, party, null);
} catch (e) { setError(“Failed: “ + e.message); }
}

function selectParty(party) {
localStorage.setItem(“bastion_session”, JSON.stringify({ role: “dm”, partyId: party.id }));
onLogin(“dm”, party, null);
}

// Player: enter code → load characters in that party
async function handlePlayerCodeSubmit() {
setError(””);
if (!playerJoinCode) { setError(“Enter a join code.”); return; }
setLoadingPlayers(true);
try {
const parties = await db.select(“parties”, “join_code=eq.” + playerJoinCode.toUpperCase());
if (!parties.length) { setError(“No party found with that code.”); setLoadingPlayers(false); return; }
const party = parties[0];
setPlayerParty(party);
const players = await db.select(“players”, “party_id=eq.” + party.id + “&order=created_at.asc”);
setPartyPlayers(players);
} catch (e) { setError(“Failed: “ + e.message); }
setLoadingPlayers(false);
}

function selectChar(player) {
localStorage.setItem(“bastion_session”, JSON.stringify({ role: “player”, partyId: player.party_id, playerId: player.id }));
onLogin(“player”, playerParty, player);
}

async function handleCreateChar() {
setError(””);
if (!charName) { setError(“Enter a character name.”); return; }
if (!playerParty) { setError(“No party selected.”); return; }
try {
const clientId = localStorage.getItem(“bastion_client_id”);
const [player] = await db.insert(“players”, { party_id: playerParty.id, client_id: clientId, character_name: charName, character_class: charClass, character_level: charLevel, is_dm: false, avatar_color: color });
localStorage.setItem(“bastion_session”, JSON.stringify({ role: “player”, partyId: playerParty.id, playerId: player.id }));
onLogin(“player”, playerParty, player);
} catch (e) { setError(“Failed: “ + e.message); }
}

const lbl = { fontSize: 11, color: “var(–text-dim)”, fontFamily: “Cinzel”, textTransform: “uppercase”, letterSpacing: 1 };

return (
<div style={{ maxWidth: 480, margin: “80px auto”, padding: “0 20px” }} className=“fade-in”>
<div style={{ textAlign: “center”, marginBottom: 40 }}>
<h1 style={{ fontSize: 32, marginBottom: 8, letterSpacing: 2 }}>⚔ Bastion Command</h1>
<p style={{ color: “var(–text-dim)”, fontSize: 16 }}>D&D 2024 Bastion Manager</p>
</div>

```
  {/* Role select */}
  {!role && (
    <div style={{ display: "flex", gap: 16 }}>
      <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer", borderColor: "var(--crimson)" }} onClick={() => setRole("dm")}>
        <h3 style={{ fontSize: 16, marginBottom: 8, color: "var(--crimson-bright)" }}>👑 Dungeon Master</h3>
        <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Full control over all bastions</p>
      </div>
      <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => setRole("player")}>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>⚔ Player</h3>
        <p style={{ fontSize: 13, color: "var(--text-dim)" }}>View your party's bastions</p>
      </div>
    </div>
  )}

  {/* ── DM LOGIN ── */}
  {role === "dm" && (
    <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button onClick={() => { setRole(null); setError(""); setAllParties([]); setCreatingParty(false); setPassword(""); setDmAuthed(false); }} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 13, padding: 0, textAlign: "left", textTransform: "none" }}>← Back</button>
      <h3 style={{ fontSize: 16, color: "var(--crimson-bright)" }}>👑 Dungeon Master</h3>

      {/* Password gate */}
      {allParties.length === 0 && !loadingParties && (
        <div>
          <label style={lbl}>Password</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter DM password" style={{ flex: 1 }}
              onKeyDown={e => { if (e.key === "Enter") handlePasswordSubmit(); }} />
            <button className="primary" onClick={handlePasswordSubmit} style={{ padding: "8px 16px" }}>Enter</button>
          </div>
        </div>
      )}

      {loadingParties && <Spinner />}

      {/* Party list */}
      {allParties.length > 0 && !creatingParty && (
        <div className="fade-in">
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>Select a party to manage:</p>
          <div style={{ display: "grid", gap: 8 }}>
            {allParties.map(p => (
              <div key={p.id} className="card" onClick={() => selectParty(p)}
                style={{ cursor: "pointer", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: 14, margin: 0 }}>{p.name}</h4>
                  <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>Code: <span style={{ fontFamily: "monospace", color: "var(--gold)", letterSpacing: 2 }}>{p.join_code}</span></p>
                </div>
                <span style={{ fontSize: 12, color: "var(--gold)" }}>→</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          <button onClick={() => setCreatingParty(true)} style={{ width: "100%", padding: 10 }}>+ Create New Party</button>
        </div>
      )}

      {/* No parties yet — show create directly */}
      {allParties.length === 0 && !loadingParties && password === DM_PASSWORD && (
        <div className="fade-in">
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>No parties found. Create your first:</p>
          <label style={lbl}>Party Name</label>
          <input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="The Swords of Waterdeep" style={{ width: "100%", marginTop: 4 }} />
          <button className="primary" onClick={handleCreateParty} style={{ width: "100%", padding: 12, marginTop: 10 }}>Create Party</button>
        </div>
      )}

      {/* Creating new party */}
      {creatingParty && (
        <div className="fade-in">
          <button onClick={() => setCreatingParty(false)} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 12, padding: 0, textTransform: "none" }}>← Back to party list</button>
          <label style={{ ...lbl, marginTop: 10, display: "block" }}>Party Name</label>
          <input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="The Swords of Waterdeep" style={{ width: "100%", marginTop: 4 }} />
          <button className="primary" onClick={handleCreateParty} style={{ width: "100%", padding: 12, marginTop: 10 }}>Create Party</button>
        </div>
      )}

      {error && <p style={{ color: "var(--crimson-bright)", fontSize: 13 }}>{error}</p>}
    </div>
  )}

  {/* ── PLAYER LOGIN ── */}
  {role === "player" && (
    <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button onClick={() => { setRole(null); setError(""); setCreatingChar(false); setPlayerParty(null); setPartyPlayers([]); setPlayerJoinCode(""); }} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 13, padding: 0, textAlign: "left", textTransform: "none" }}>← Back</button>
      <h3 style={{ fontSize: 16 }}>⚔ Player Login</h3>

      {/* Step 1: Enter party code */}
      {!playerParty && (
        <div>
          <label style={lbl}>Party Join Code</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input value={playerJoinCode} onChange={e => setPlayerJoinCode(e.target.value)} placeholder="Get this from your DM" style={{ flex: 1, textTransform: "uppercase" }} maxLength={6}
              onKeyDown={e => { if (e.key === "Enter") handlePlayerCodeSubmit(); }} />
            <button className="primary" onClick={handlePlayerCodeSubmit} disabled={!playerJoinCode || loadingPlayers} style={{ padding: "8px 16px" }}>{loadingPlayers ? "..." : "Enter"}</button>
          </div>
        </div>
      )}

      {/* Step 2: Pick character or create new */}
      {playerParty && !creatingChar && (
        <div className="fade-in">
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>Party: <strong style={{ color: "var(--gold)" }}>{playerParty.name}</strong></p>

          {partyPlayers.length > 0 ? (
            <>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>Select your character:</p>
              <div style={{ display: "grid", gap: 8 }}>
                {partyPlayers.map(p => (
                  <div key={p.id} className="card" onClick={() => selectChar(p)}
                    style={{ cursor: "pointer", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.avatar_color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Cinzel", fontSize: 16, color: "var(--bg-deep)", fontWeight: 700 }}>{p.character_name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, margin: 0 }}>{p.character_name}</h4>
                      <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{p.character_class} · Level {p.character_level}</p>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--gold)" }}>→</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>No characters in this party yet. Create the first one:</p>
          )}
          <button onClick={() => setCreatingChar(true)} style={{ width: "100%", padding: 10 }}>+ Create New Character</button>
          <button onClick={() => { setPlayerParty(null); setPartyPlayers([]); setPlayerJoinCode(""); }} style={{ width: "100%", padding: 8, background: "none", border: "none", color: "var(--text-dim)", fontSize: 12, marginTop: 4, textTransform: "none" }}>← Different party code</button>
        </div>
      )}

      {/* Step 3: Create character form */}
      {playerParty && creatingChar && (
        <div className="fade-in">
          <button onClick={() => setCreatingChar(false)} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 12, padding: 0, textTransform: "none", marginBottom: 8 }}>← Back to character list</button>
          <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>Joining: <strong style={{ color: "var(--gold)" }}>{playerParty.name}</strong></p>
          <h4 style={{ fontSize: 14, marginBottom: 10 }}>Character Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Name</label><input value={charName} onChange={e => setCharName(e.target.value)} placeholder="Kira" style={{ width: "100%", marginTop: 4 }} /></div>
            <div><label style={lbl}>Class</label><select value={charClass} onChange={e => setCharClass(e.target.value)} style={{ width: "100%", marginTop: 4 }}>{CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ marginTop: 10 }}><label style={lbl}>Level</label><input type="number" min={1} max={20} value={charLevel} onChange={e => setCharLevel(parseInt(e.target.value) || 1)} style={{ width: "100%", marginTop: 4 }} /></div>
          <div style={{ marginTop: 10 }}>
            <label style={lbl}>Color</label>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {AVATAR_COLORS.map(c => <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "2px solid var(--text-bright)" : "2px solid transparent" }} />)}
            </div>
          </div>
          <button className="primary" onClick={handleCreateChar} style={{ width: "100%", padding: 12, marginTop: 14 }}>Create & Join</button>
        </div>
      )}

      {error && <p style={{ color: "var(--crimson-bright)", fontSize: 13 }}>{error}</p>}
    </div>
  )}
</div>
```

);
}

// ─── FACILITY OPTIONS ───────────────────────────────────────────

function FacilityOptions({ facility, facilityDef, db, onReload, showToast, readOnly }) {
if (!facilityDef?.hasOptions) return null;
async function updateOption(field, value) {
try { await db.update(“facilities”, { id: facility.id }, { [field]: value }); if (showToast) showToast(“Option updated”); if (onReload) onReload(); } catch (e) { console.error(e); }
}
const optStyle = { fontSize: 12, padding: “3px 6px”, background: “var(–bg-input)”, border: “1px solid var(–border)”, color: “var(–text)”, borderRadius: 3 };
const labelStyle = { fontSize: 11, color: “var(–text-dim)”, marginRight: 4 };
const optMap = { garden_type: { label: “Garden”, value: facility.garden_type, options: GARDEN_TYPES }, pub_beverage: { label: “Beverage”, value: facility.pub_beverage, options: PUB_BEVERAGES }, training_type: { label: “Trainer”, value: facility.training_type, options: TRAINING_TYPES }, guild_type: { label: “Guild”, value: facility.guild_type, options: GUILD_TYPES }, manifest_plane: { label: “Plane”, value: facility.manifest_plane, options: MANIFEST_PLANES }, museum_charm: { label: “Origin”, value: facility.museum_charm, options: MUSEUM_CHARMS }, archive_books: { label: “Book”, value: (facility.archive_books || [])[0], options: ARCHIVE_BOOKS } };
if (facilityDef.hasOptions === “workshop_tools”) return <div style={{ marginTop: 6 }}><span style={labelStyle}>Tools:</span><span style={{ fontSize: 11, color: “var(–text-dim)” }}>{(facility.workshop_tools || []).join(”, “) || “Not configured”}</span></div>;
const opt = optMap[facilityDef.hasOptions];
if (!opt) return null;
return (
<div style={{ marginTop: 6, display: “flex”, gap: 10, flexWrap: “wrap”, alignItems: “center” }}>
<span style={labelStyle}>{opt.label}:</span>
{readOnly ? <span style={{ fontSize: 12, color: “var(–text)” }}>{opt.value || “—”}</span> : (
<select value={opt.value || “”} onChange={e => { const field = facilityDef.hasOptions === “archive_books” ? “archive_books” : facilityDef.hasOptions; const val = facilityDef.hasOptions === “archive_books” ? [e.target.value] : e.target.value; updateOption(field, val); }} style={optStyle}>
{opt.options.map(o => <option key={o} value={o}>{o}</option>)}
</select>
)}
</div>
);
}

// ─── BASTION VIEW ───────────────────────────────────────────────

function BastionView({ bastion, facilities, defenders, hirelings, player, onRemoveFacility, onAddDefender, onAddHireling, onEnlargeFacility, onUpdateWalls, onSwapFacility, db, onReload, showToast, readOnly }) {
const [newDefName, setNewDefName] = useState(””);
const [defFacility, setDefFacility] = useState(””);
const [showHireForm, setShowHireForm] = useState(null);
const [hireName, setHireName] = useState(””);
const [hireRole, setHireRole] = useState(””);
const [swappingFac, setSwappingFac] = useState(null);
const [swapTarget, setSwapTarget] = useState(””);
const specialFacs = facilities.filter(f => f.facility_type === “special”);
const basicFacs = facilities.filter(f => f.facility_type === “basic”);
const aliveDefenders = defenders.filter(d => d.is_alive);
const barracks = facilities.filter(f => f.facility_key === “barrack”);
const maxSpecial = getMaxSpecialFacilities(player.character_level);
return (
<div>
<div className=“card” style={{ marginBottom: 16, background: “linear-gradient(135deg, var(–bg-card) 0%, #2A2418 100%)”, borderColor: “var(–border-gold)” }}>
<h2 style={{ fontSize: 20, marginBottom: 4 }}>{bastion.name}</h2>
{bastion.description && <p style={{ color: “var(–text-dim)”, fontSize: 14, marginBottom: 12 }}>{bastion.description}</p>}
<div style={{ display: “flex”, gap: 20, flexWrap: “wrap”, fontSize: 13 }}>
<span>Special: <strong style={{ color: “var(–gold)” }}>{specialFacs.length}/{maxSpecial}</strong></span>
<span>Basic: <strong>{basicFacs.length}</strong></span>
<span>Defenders: <strong style={{ color: aliveDefenders.length > 0 ? “var(–green)” : “var(–crimson-bright)” }}>{aliveDefenders.length}</strong></span>
<span>Walls: <strong>{bastion.defensive_wall_squares || 0}</strong> sq{bastion.walls_fully_enclosed ? “ ✓” : “”}</span>
</div>
</div>
<h3 style={{ fontSize: 15, marginBottom: 10 }}>Special Facilities</h3>
{specialFacs.length === 0 ? <p style={{ color: “var(–text-dim)”, fontSize: 14, marginBottom: 16 }}>No special facilities yet.</p> : (
<div style={{ display: “grid”, gap: 10, marginBottom: 20 }}>
{specialFacs.map(f => { const def = SPECIAL_FACILITIES.find(sf => sf.key === f.facility_key); const facHirelings = hirelings.filter(h => h.facility_id === f.id); return (
<div key={f.id} className=“card” style={{ borderLeft: “3px solid “ + (def ? SET_COLORS[def.set] : “var(–gold)”) }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start” }}>
<div style={{ flex: 1 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8, marginBottom: 4, flexWrap: “wrap” }}>
<h4 style={{ fontSize: 15, margin: 0 }}>{def?.name || f.facility_key}</h4>
<span className=“badge” style={{ background: “var(–bg-deep)”, color: “var(–text-dim)”, border: “1px solid var(–border)”, fontSize: 10 }}>{SIZES[f.size].label} · {SIZES[f.size].squares} sq</span>
{def && <span className=“badge” style={{ background: “var(–bg-deep)”, color: “var(–text-dim)”, border: “1px solid var(–border)”, fontSize: 10 }}>{def.order}</span>}
</div>
{def && <p style={{ fontSize: 13, color: “var(–text-dim)” }}>{def.desc}</p>}
<FacilityOptions facility={f} facilityDef={def} db={db} onReload={onReload} showToast={showToast} readOnly={readOnly} />
{f.order_status && f.order_duration > 0 && (
<div style={{ marginTop: 6, padding: “6px 8px”, background: “var(–bg-deep)”, borderRadius: 4 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, fontSize: 11, color: f.order_progress >= f.order_duration ? “var(–green)” : “var(–gold-dim)”, marginBottom: 3 }}>
<span>{f.order_status}</span>
<span>{f.order_progress >= f.order_duration ? “✓ Complete” : `${f.order_progress}/${f.order_duration} days`}</span>
</div>
<div style={{ height: 5, background: “var(–border)”, borderRadius: 3, overflow: “hidden” }}>
<div style={{ height: “100%”, width: `${Math.min(100, (f.order_progress / f.order_duration) * 100)}%`, background: f.order_progress >= f.order_duration ? “var(–green)” : “var(–gold)”, borderRadius: 3, transition: “width 0.3s” }} />
</div>
</div>
)}
<div style={{ marginTop: 6 }}>
<span style={{ fontSize: 11, color: “var(–text-dim)”, fontFamily: “Cinzel”, textTransform: “uppercase” }}>Hirelings ({facHirelings.length}/{def?.hirelings || “?”}):</span>{” “}
{facHirelings.map(h => <span key={h.id} style={{ fontSize: 12, color: “var(–text)”, marginRight: 8 }}>{h.name}{h.role ? “ (” + h.role + “)” : “”}</span>)}
{!readOnly && facHirelings.length < (def?.hirelings || 1) && (showHireForm === f.id ? (
<span style={{ display: “inline-flex”, gap: 4, alignItems: “center” }}>
<input value={hireName} onChange={e => setHireName(e.target.value)} placeholder=“Name” style={{ width: 90, padding: “2px 6px”, fontSize: 12 }} />
<input value={hireRole} onChange={e => setHireRole(e.target.value)} placeholder=“Role” style={{ width: 70, padding: “2px 6px”, fontSize: 12 }} />
<button onClick={() => { onAddHireling(f.id, hireName || “Unnamed”, hireRole); setShowHireForm(null); setHireName(””); setHireRole(””); }} style={{ fontSize: 10, padding: “2px 6px” }}>+</button>
</span>
) : <button onClick={() => setShowHireForm(f.id)} style={{ fontSize: 10, padding: “2px 6px”, background: “none”, border: “1px solid var(–border)”, color: “var(–text-dim)” }}>+ Add</button>)}
</div>
</div>
{!readOnly && <div style={{ display: “flex”, flexDirection: “column”, gap: 4 }}>
{def?.enlarge && f.size !== “vast” && !f.order_status && <button onClick={() => onEnlargeFacility(f.id, f.facility_key)} style={{ fontSize: 9, padding: “3px 8px”, color: “var(–blue)” }}>Enlarge (2,000 GP)</button>}
{!f.order_status && <button onClick={() => setSwappingFac(swappingFac === f.id ? null : f.id)} style={{ fontSize: 9, padding: “3px 8px”, color: “var(–text-dim)” }}>{swappingFac === f.id ? “Cancel” : “Swap”}</button>}
<button className=“danger” onClick={() => onRemoveFacility(f.id)} style={{ fontSize: 10, padding: “4px 10px” }}>Remove</button>
</div>}
</div>
{swappingFac === f.id && (
<div style={{ marginTop: 8, paddingTop: 8, borderTop: “1px solid var(–border)”, display: “flex”, gap: 8, alignItems: “center”, flexWrap: “wrap” }} className=“fade-in”>
<span style={{ fontSize: 11, color: “var(–text-dim)” }}>Replace with:</span>
<select value={swapTarget} onChange={e => setSwapTarget(e.target.value)} style={{ fontSize: 11, padding: “4px 8px”, flex: “1 1 200px” }}>
<option value="">— Select facility —</option>
{SPECIAL_FACILITIES.filter(sf => sf.level <= player.character_level && sf.key !== f.facility_key && (sf.multi || !specialFacs.some(x => x.facility_key === sf.key))).map(sf => (
<option key={sf.key} value={sf.key}>{sf.name} (Lvl {sf.level}, {sf.order}){sf.prereq ? “ ⚠” : “”}</option>
))}
</select>
<button className=“primary” onClick={() => { if (swapTarget) { onSwapFacility(f.id, swapTarget, SPECIAL_FACILITIES.find(sf => sf.key === swapTarget)?.space || “roomy”); setSwappingFac(null); setSwapTarget(””); } }} disabled={!swapTarget} style={{ fontSize: 10, padding: “4px 12px” }}>Confirm Swap</button>
</div>
)}
</div>
); })}
</div>
)}
<h3 style={{ fontSize: 15, marginBottom: 10 }}>Basic Facilities</h3>
{basicFacs.length === 0 ? <p style={{ color: “var(–text-dim)”, fontSize: 14, marginBottom: 16 }}>No basic facilities yet.</p> : (
<div style={{ display: “flex”, gap: 8, flexWrap: “wrap”, marginBottom: 20 }}>
{basicFacs.map(f => <div key={f.id} className=“card” style={{ padding: “8px 14px”, display: “flex”, alignItems: “center”, gap: 8 }}>
<span style={{ fontSize: 13, textTransform: “capitalize” }}>{f.facility_key.replace(/_/g, “ “)}</span>
<span style={{ fontSize: 11, color: “var(–text-dim)” }}>({SIZES[f.size].label})</span>
{!readOnly && <button className=“danger” onClick={() => onRemoveFacility(f.id)} style={{ fontSize: 9, padding: “2px 6px”, marginLeft: 4 }}>✕</button>}
</div>)}
</div>
)}
<h3 style={{ fontSize: 15, marginBottom: 10 }}>Defenders ({aliveDefenders.length})</h3>
<div className=“card” style={{ marginBottom: 20 }}>
{aliveDefenders.length === 0 && <p style={{ color: “var(–text-dim)”, fontSize: 13 }}>No defenders.</p>}
{aliveDefenders.length > 0 && <div style={{ display: “flex”, gap: 6, flexWrap: “wrap”, marginBottom: readOnly ? 0 : 10 }}>{aliveDefenders.map(d => <span key={d.id} style={{ fontSize: 12, padding: “3px 10px”, background: “var(–bg-deep)”, border: “1px solid var(–border)”, borderRadius: 3 }}>{d.name}{d.creature_type ? “ (” + d.creature_type + “)” : “”}</span>)}</div>}
{!readOnly && barracks.length > 0 && (() => {
const selBarrack = barracks.find(b => b.id === defFacility);
const cap = selBarrack ? getBarrackCapacity(selBarrack.size) : 12;
const housed = defenders.filter(d => d.is_alive && d.facility_id === defFacility).length;
const full = selBarrack && housed >= cap;
return (
<div style={{ display: “flex”, gap: 6, alignItems: “center”, flexWrap: “wrap” }}>
<input value={newDefName} onChange={e => setNewDefName(e.target.value)} placeholder=“Defender name” style={{ padding: “4px 8px”, fontSize: 12, width: 160 }} />
<select value={defFacility} onChange={e => setDefFacility(e.target.value)} style={{ padding: “4px 8px”, fontSize: 12 }}>
<option value="">Select barrack…</option>
{barracks.map(b => { const c = getBarrackCapacity(b.size); const h = defenders.filter(d => d.is_alive && d.facility_id === b.id).length; return <option key={b.id} value={b.id}>Barrack ({SIZES[b.size].label}) — {h}/{c}</option>; })}
</select>
<button onClick={() => { if (newDefName && defFacility) { onAddDefender(newDefName, defFacility); setNewDefName(””); } }} disabled={!newDefName || !defFacility || full} style={{ fontSize: 10, padding: “4px 10px” }}>{full ? “Full” : “Recruit”}</button>
</div>
);
})()}
</div>

```
  {/* Defensive Walls */}
  <h3 style={{ fontSize: 15, marginBottom: 10 }}>Defensive Walls</h3>
  <div className="card" style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", fontSize: 13 }}>
      <span>Wall squares: <strong style={{ color: "var(--gold)" }}>{bastion.defensive_wall_squares || 0}</strong></span>
      <span>Cost: <span style={{ color: "var(--text-dim)" }}>{((bastion.defensive_wall_squares || 0) * 250).toLocaleString()} GP</span></span>
      <span>Enclosed: <strong style={{ color: bastion.walls_fully_enclosed ? "var(--green)" : "var(--text-dim)" }}>{bastion.walls_fully_enclosed ? "Yes (−2 attack dice)" : "No"}</strong></span>
    </div>
    {!readOnly && (
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={() => onUpdateWalls((bastion.defensive_wall_squares || 0) + 1, bastion.walls_fully_enclosed)} style={{ fontSize: 10, padding: "4px 10px" }}>+1 sq (250 GP)</button>
        <button onClick={() => onUpdateWalls((bastion.defensive_wall_squares || 0) + 4, bastion.walls_fully_enclosed)} style={{ fontSize: 10, padding: "4px 10px" }}>+4 sq (1,000 GP)</button>
        <button onClick={() => onUpdateWalls(bastion.defensive_wall_squares || 0, !bastion.walls_fully_enclosed)} style={{ fontSize: 10, padding: "4px 10px", color: bastion.walls_fully_enclosed ? "var(--crimson-bright)" : "var(--green)" }}>{bastion.walls_fully_enclosed ? "Mark Open" : "Mark Enclosed"}</button>
        {(bastion.defensive_wall_squares || 0) > 0 && <button onClick={() => onUpdateWalls(0, false)} className="danger" style={{ fontSize: 10, padding: "4px 10px" }}>Reset</button>}
      </div>
    )}
    <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>20ft high, 250 GP per 5ft square, 10 days per square to build. Fully enclosed walls reduce attack dice from 6d6 to 4d6.</p>
  </div>
</div>
```

);
}

function CreateBastionForm({ onCreate }) {
const [name, setName] = useState(””); const [desc, setDesc] = useState(””);
return (
<div className=“card” style={{ maxWidth: 500, margin: “40px auto”, textAlign: “center” }}>
<h3 style={{ marginBottom: 16 }}>Establish Bastion</h3>
<div style={{ display: “flex”, flexDirection: “column”, gap: 12, textAlign: “left” }}>
<div><label style={{ fontSize: 11, color: “var(–text-dim)”, fontFamily: “Cinzel”, textTransform: “uppercase”, letterSpacing: 1 }}>Bastion Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder=“The Ember Sanctum” style={{ width: “100%”, marginTop: 4 }} /></div>
<div><label style={{ fontSize: 11, color: “var(–text-dim)”, fontFamily: “Cinzel”, textTransform: “uppercase”, letterSpacing: 1 }}>Description</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder=“A converted watchtower…” style={{ width: “100%”, marginTop: 4, minHeight: 60, resize: “vertical” }} /></div>
<button className=“primary” onClick={() => onCreate(name, desc)} disabled={!name} style={{ width: “100%”, padding: 12 }}>Establish Bastion</button>
</div>
</div>
);
}

// ─── FACILITY BROWSER ───────────────────────────────────────────

function FacilityBrowser({ level, currentFacilities, maxSpecial, currentSpecialCount, onAdd, onAddBasic }) {
const [filterSet, setFilterSet] = useState(“all”); const [filterLevel, setFilterLevel] = useState(“all”); const [filterOrder, setFilterOrder] = useState(“all”); const [search, setSearch] = useState(””); const [basicSize, setBasicSize] = useState(“roomy”);
const currentKeys = currentFacilities.filter(f => f.facility_type === “special”).map(f => f.facility_key);
const atCap = currentSpecialCount >= maxSpecial;
const filtered = SPECIAL_FACILITIES.filter(f => { if (filterSet !== “all” && f.set !== filterSet) return false; if (filterLevel !== “all” && f.level !== parseInt(filterLevel)) return false; if (filterOrder !== “all” && f.order !== filterOrder) return false; if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.desc.toLowerCase().includes(search.toLowerCase())) return false; return true; });
return (
<div>
<div className=“card” style={{ marginBottom: 16, display: “flex”, justifyContent: “space-between”, alignItems: “center”, flexWrap: “wrap”, gap: 8 }}>
<span style={{ fontSize: 14 }}>Special: <strong style={{ color: atCap ? “var(–crimson-bright)” : “var(–gold)” }}>{currentSpecialCount}/{maxSpecial}</strong> slots</span>
<span style={{ fontSize: 12, color: “var(–text-dim)” }}>Level {level}</span>
</div>
<div className=“card” style={{ marginBottom: 20 }}>
<h4 style={{ fontSize: 14, marginBottom: 10 }}>Basic Facilities</h4>
<div style={{ display: “flex”, gap: 6, flexWrap: “wrap”, alignItems: “center” }}>
{BASIC_FACILITIES.map(bf => <button key={bf} onClick={() => onAddBasic(bf, basicSize)} style={{ fontSize: 11, padding: “6px 12px” }}>{bf}</button>)}
<select value={basicSize} onChange={e => setBasicSize(e.target.value)} style={{ fontSize: 11, padding: “4px 8px” }}><option value="cramped">Cramped</option><option value="roomy">Roomy</option><option value="vast">Vast</option></select>
</div>
</div>
<div style={{ display: “flex”, gap: 8, marginBottom: 14, flexWrap: “wrap” }}>
<input value={search} onChange={e => setSearch(e.target.value)} placeholder=“Search…” style={{ flex: “1 1 180px”, padding: “6px 10px”, fontSize: 13 }} />
<select value={filterSet} onChange={e => setFilterSet(e.target.value)} style={{ fontSize: 12, padding: “6px 8px” }}><option value="all">All Sets</option><option value="core">Core</option><option value="fr">FR</option><option value="eberron">Eberron</option></select>
<select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ fontSize: 12, padding: “6px 8px” }}><option value="all">All Lvl</option><option value="5">5</option><option value="9">9</option><option value="13">13</option><option value="17">17</option></select>
<select value={filterOrder} onChange={e => setFilterOrder(e.target.value)} style={{ fontSize: 12, padding: “6px 8px” }}><option value="all">All Orders</option>{ORDER_TYPES.filter(o => o !== “Maintain”).map(o => <option key={o} value={o}>{o}</option>)}</select>
</div>
<p style={{ fontSize: 12, color: “var(–text-dim)”, marginBottom: 12 }}>{filtered.length} facilities</p>
<div style={{ display: “grid”, gap: 10 }}>
{filtered.map(fac => {
const alreadyAdded = !fac.multi && currentKeys.includes(fac.key);
const tooHighLevel = fac.level > level;
const disabled = (atCap && !alreadyAdded) || tooHighLevel;
return <FacilityCard key={fac.key} fac={fac} added={alreadyAdded} disabled={disabled} onAdd={(f) => {
const options = {};
if (f.hasOptions === “garden_type”) options.garden_type = GARDEN_TYPES[0];
if (f.hasOptions === “pub_beverage”) options.pub_beverage = PUB_BEVERAGES[0];
if (f.hasOptions === “training_type”) options.training_type = TRAINING_TYPES[0];
if (f.hasOptions === “guild_type”) options.guild_type = GUILD_TYPES[0];
if (f.hasOptions === “manifest_plane”) options.manifest_plane = MANIFEST_PLANES[0];
if (f.hasOptions === “museum_charm”) options.museum_charm = MUSEUM_CHARMS[0];
onAdd(f, options);
}} />;
})}
</div>
</div>
);
}

// ─── DASHBOARD ──────────────────────────────────────────────────

function Dashboard({ party, role, selectedPlayer, onLogout }) {
const isDM = role === “dm”;
const [partyState, setPartyState] = useState(party);
const [tab, setTab] = useState(“overview”);
const [viewingPlayerId, setViewingPlayerId] = useState(selectedPlayer?.id || null);
const [bastion, setBastion] = useState(null);
const [facilities, setFacilities] = useState([]);
const [defenders, setDefenders] = useState([]);
const [hirelingList, setHirelings] = useState([]);
const [partyMembers, setPartyMembers] = useState([]);
const [partyBastions, setPartyBastions] = useState({});
const [loading, setLoading] = useState(true);
const [toast, setToast] = useState(””);
const showToast = useCallback((msg) => setToast(msg), []);

const viewPlayer = partyMembers.find(m => m.id === viewingPlayerId) || partyMembers[0] || null;

const loadData = useCallback(async () => {
try {
const members = await db.select(“players”, “party_id=eq.” + party.id + “&order=created_at.asc”);
setPartyMembers(members);
const allBastions = {};
for (const m of members) {
const b = await db.select(“bastions”, “player_id=eq.” + m.id);
if (b.length) { const facs = await db.select(“facilities”, “bastion_id=eq.” + b[0].id + “&order=created_at.asc”); allBastions[m.id] = { bastion: b[0], facilities: facs }; }
}
setPartyBastions(allBastions);
const pid = viewingPlayerId || members[0]?.id;
if (pid) {
const pb = allBastions[pid];
if (pb) {
setBastion(pb.bastion); setFacilities(pb.facilities);
const defs = await db.select(“defenders”, “bastion_id=eq.” + pb.bastion.id + “&order=created_at.asc”); setDefenders(defs);
const facIds = pb.facilities.map(f => f.id);
if (facIds.length > 0) { const hirs = await db.select(“hirelings”, “facility_id=in.(” + facIds.join(”,”) + “)&order=created_at.asc”); setHirelings(hirs); } else { setHirelings([]); }
} else { setBastion(null); setFacilities([]); setDefenders([]); setHirelings([]); }
}
} catch (e) { console.error(e); }
setLoading(false);
}, [party.id, viewingPlayerId, partyState?.current_day]);

useEffect(() => { loadData(); }, [loadData]);

function switchPlayer(pid) {
if (pid === viewingPlayerId) { setTab(“bastion”); return; }
setViewingPlayerId(pid); setLoading(true); setTab(“bastion”);
}

async function createBastion(name, desc) { if (!viewPlayer) return; const [b] = await db.insert(“bastions”, { player_id: viewPlayer.id, name, description: desc }); setBastion(b); showToast(“Bastion created!”); loadData(); sendToDiscord(msgBastionCreated(viewPlayer.character_name, name, desc)); }
async function addFacility(key, type, size, opts = {}) { if (!bastion) return; await db.insert(“facilities”, { bastion_id: bastion.id, facility_key: key, facility_type: type, size, …opts }); const fd = SPECIAL_FACILITIES.find(f => f.key === key); showToast(“Facility added!”); loadData(); sendToDiscord(msgFacilityAdded(viewPlayer?.character_name, fd?.name || key, type)); }
async function removeFacility(id) { const f = facilities.find(x => x.id === id); const fd = f ? SPECIAL_FACILITIES.find(sf => sf.key === f.facility_key) : null; await db.delete(“facilities”, { id }); showToast(“Removed”); loadData(); sendToDiscord(msgFacilityRemoved(viewPlayer?.character_name || “”, fd?.name || f?.facility_key || “”)); }
async function addDefender(name, fid) { if (!bastion) return; await db.insert(“defenders”, { bastion_id: bastion.id, facility_id: fid, name }); showToast(“Recruited!”); loadData(); sendToDiscord(msgDefenderRecruited(viewPlayer?.character_name, bastion.name, name)); }
async function addHireling(fid, name, role) { await db.insert(“hirelings”, { facility_id: fid, name, role }); showToast(“Hireling added!”); loadData(); }
async function enlargeFacility(facId, facKey) { await db.update(“facilities”, { id: facId }, { order_status: “Enlarging to Vast”, order_progress: 0, order_duration: ENLARGE_COST.time_days }); const fd = SPECIAL_FACILITIES.find(f => f.key === facKey); showToast(`Enlarging ${fd?.name || facKey}...`); loadData(); sendToDiscord(`🔨 ${viewPlayer?.character_name}'s **${fd?.name || facKey}** is being enlarged to Vast (${ENLARGE_COST.time_days} days, ${ENLARGE_COST.cost_gp.toLocaleString()} GP).`); }
async function updateWalls(squares, enclosed) { if (!bastion) return; await db.update(“bastions”, { id: bastion.id }, { defensive_wall_squares: squares, walls_fully_enclosed: enclosed }); showToast(“Walls updated”); loadData(); }
async function swapFacility(oldFacId, newKey, newSpace) { await db.delete(“facilities”, { id: oldFacId }); await db.insert(“facilities”, { bastion_id: bastion.id, facility_key: newKey, facility_type: “special”, size: newSpace }); const fd = SPECIAL_FACILITIES.find(f => f.key === newKey); showToast(`Swapped to ${fd?.name || newKey}`); loadData(); sendToDiscord(`🔄 ${viewPlayer?.character_name} swapped a facility for **${fd?.name || newKey}**.`); }
async function updateLevel(pid, lvl) { await db.update(“players”, { id: pid }, { character_level: lvl }); showToast(“Level “ + lvl); loadData(); }
async function removePlayer(pid) { const m = partyMembers.find(x => x.id === pid); await db.delete(“players”, { id: pid }); showToast(“Removed”); loadData(); if (m) sendToDiscord(msgPlayerRemoved(m.character_name)); if (viewingPlayerId === pid) { const next = partyMembers.find(x => x.id !== pid); if (next) switchPlayer(next.id); } }
async function deleteParty() { await db.delete(“parties”, { id: party.id }); localStorage.removeItem(“bastion_session”); setTimeout(() => window.location.reload(), 1000); }

if (loading) return <Spinner />;

const maxSpecial = viewPlayer ? getMaxSpecialFacilities(viewPlayer.character_level) : 0;
const currentSpecialCount = facilities.filter(f => f.facility_type === “special”).length;

return (
<div style={{ maxWidth: 900, margin: “0 auto”, padding: “20px 16px 60px” }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 20, flexWrap: “wrap”, gap: 12 }}>
<div>
<h1 style={{ fontSize: 22, letterSpacing: 1.5 }}>⚔ {party.name}</h1>
<p style={{ fontSize: 13, color: “var(–text-dim)”, marginTop: 2 }}>{isDM && <>Code: <span style={{ color: “var(–gold)”, fontFamily: “monospace”, letterSpacing: 2 }}>{party.join_code}</span> · </>}<span style={{ color: isDM ? “var(–crimson-bright)” : “var(–text-dim)” }}>{isDM ? “👑 DM” : “⚔ “ + (selectedPlayer?.character_name || “Player”)}</span></p>
</div>
<div style={{ display: “flex”, alignItems: “center”, gap: 10 }}>
{isDM && partyMembers.length > 0 && <select value={viewingPlayerId || “”} onChange={e => switchPlayer(e.target.value)} style={{ fontSize: 12, padding: “6px 10px” }}>{partyMembers.map(m => <option key={m.id} value={m.id}>{m.character_name} ({m.character_class} {m.character_level})</option>)}</select>}
<button onClick={onLogout} style={{ fontSize: 10, padding: “6px 12px”, color: “var(–text-dim)”, borderColor: “var(–border)” }}>Logout</button>
</div>
</div>

```
  <Tabs tabs={isDM ? [{ key: "overview", label: "Party (" + partyMembers.length + ")" }, { key: "bastion", label: "Bastion" }, { key: "turns", label: "Turns" }, { key: "facilities", label: "Add Facilities" }, { key: "dm", label: "⚙ Manage" }] : [{ key: "overview", label: "Party (" + partyMembers.length + ")" }, { key: "bastion", label: "Bastion" }, { key: "turns", label: "Turns" }]} active={tab} onChange={setTab} />

  {tab === "overview" && <PartyOverview partyMembers={partyMembers} partyBastions={partyBastions} viewingPlayerId={viewingPlayerId} isDM={isDM} onSwitch={switchPlayer} />}

  {tab === "bastion" && (
    <div className="fade-in">
      {!viewPlayer ? <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>{isDM ? "Select a player above." : "No data."}</p>
      : !bastion ? (isDM ? <CreateBastionForm onCreate={createBastion} /> : <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>No bastion for {viewPlayer.character_name} yet.</p>)
      : <>
          {isDM && <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>Managing: <strong style={{ color: "var(--gold)" }}>{viewPlayer.character_name}</strong></p>}
          <BastionView bastion={bastion} facilities={facilities} defenders={defenders} hirelings={hirelingList} player={viewPlayer} onRemoveFacility={removeFacility} onAddDefender={addDefender} onAddHireling={addHireling} onEnlargeFacility={enlargeFacility} onUpdateWalls={updateWalls} onSwapFacility={swapFacility} db={db} onReload={loadData} showToast={showToast} readOnly={!isDM} />
        </>}
    </div>
  )}

  {tab === "turns" && <div className="fade-in">{viewPlayer && isDM && <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>Turns for: <strong style={{ color: "var(--gold)" }}>{viewPlayer.character_name}</strong></p>}<TurnManager bastion={bastion} facilities={facilities} defenders={defenders} player={viewPlayer} showToast={showToast} onReload={loadData} readOnly={!isDM} party={partyState} onUpdateParty={setPartyState} /></div>}

  {tab === "facilities" && isDM && (
    <div className="fade-in">
      {!bastion || !viewPlayer ? <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>Create bastion first.</p>
      : <><p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>Adding to: <strong style={{ color: "var(--gold)" }}>{viewPlayer.character_name}</strong></p><FacilityBrowser level={viewPlayer.character_level} currentFacilities={facilities} maxSpecial={maxSpecial} currentSpecialCount={currentSpecialCount} onAdd={(fac, opts) => addFacility(fac.key, "special", fac.space, opts)} onAddBasic={(n, s) => addFacility(n.toLowerCase().replace(/ /g, "_"), "basic", s)} /></>}
    </div>
  )}

  {tab === "dm" && isDM && <DMManageTab partyMembers={partyMembers} onUpdateLevel={updateLevel} onRemovePlayer={removePlayer} onDeleteParty={deleteParty} />}

  {toast && <Toast message={toast} onClose={() => setToast("")} />}
</div>
```

);
}

// ─── PARTY OVERVIEW (shared by DM and Player) ───────────────────

function PartyOverview({ partyMembers, partyBastions, viewingPlayerId, isDM, onSwitch }) {
return (
<div className=“fade-in” style={{ display: “grid”, gap: 16 }}>
{partyMembers.map(m => {
const pb = partyBastions[m.id]; const isViewing = m.id === viewingPlayerId;
return (
<div key={m.id} className=“card” style={{ borderColor: isViewing && isDM ? “var(–gold-dim)” : “var(–border)”, cursor: isDM ? “pointer” : “default” }} onClick={() => isDM && onSwitch(m.id)}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 10 }}>
<div style={{ width: 36, height: 36, borderRadius: “50%”, background: m.avatar_color, display: “flex”, alignItems: “center”, justifyContent: “center”, fontFamily: “Cinzel”, fontSize: 16, color: “var(–bg-deep)”, fontWeight: 700 }}>{m.character_name[0]}</div>
<div>
<h4 style={{ fontSize: 15, margin: 0 }}>{m.character_name}{isViewing && isDM && <span style={{ fontSize: 10, color: “var(–gold)”, marginLeft: 6 }}>(viewing)</span>}</h4>
<p style={{ fontSize: 12, color: “var(–text-dim)” }}>{m.character_class} · Level {m.character_level}</p>
</div>
</div>
{pb ? (
<div>
<p style={{ fontSize: 14 }}><strong style={{ color: “var(–gold)” }}>{pb.bastion.name}</strong>{pb.bastion.description ? <span style={{ color: “var(–text-dim)” }}> — {pb.bastion.description}</span> : “”}</p>
<div style={{ display: “flex”, gap: 6, flexWrap: “wrap”, marginTop: 8 }}>
{pb.facilities.filter(f => f.facility_type === “special”).map(f => { const fd = SPECIAL_FACILITIES.find(sf => sf.key === f.facility_key); return <span key={f.id} className=“badge” style={{ background: “var(–bg-deep)”, color: “var(–gold)”, border: “1px solid var(–border-gold)”, fontSize: 11 }}>{fd?.name || f.facility_key}</span>; })}
</div>
</div>
) : <p style={{ fontSize: 13, color: “var(–text-dim)”, fontStyle: “italic” }}>No bastion yet</p>}
</div>
);
})}
{partyMembers.length === 0 && <p style={{ color: “var(–text-dim)”, textAlign: “center”, padding: 20 }}>No players yet. Share the join code.</p>}
</div>
);
}

// ─── DM MANAGE TAB ──────────────────────────────────────────────

function DMManageTab({ partyMembers, onUpdateLevel, onRemovePlayer, onDeleteParty }) {
return (
<div className="fade-in">
<div className=“card” style={{ borderColor: “var(–crimson)”, background: “linear-gradient(135deg, var(–bg-card) 0%, #2A1E1E 100%)” }}>
<h3 style={{ fontSize: 16, margin: 0, color: “var(–crimson-bright)”, marginBottom: 12 }}>⚙ Party Management</h3>
<div style={{ display: “grid”, gap: 10 }}>
{partyMembers.map(m => <PlayerRow key={m.id} member={m} onUpdate={onUpdateLevel} onRemove={onRemovePlayer} />)}
</div>
<div className="divider" />
<DeleteBtn onDelete={onDeleteParty} />
</div>
</div>
);
}

function PlayerRow({ member, onUpdate, onRemove }) {
const [editing, setEditing] = useState(false); const [level, setLevel] = useState(member.character_level); const [confirm, setConfirm] = useState(false);
return (
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, gap: 10, padding: “8px 12px”, background: “var(–bg-deep)”, borderRadius: 4, border: “1px solid var(–border)” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8 }}>
<div style={{ width: 28, height: 28, borderRadius: “50%”, background: member.avatar_color, display: “flex”, alignItems: “center”, justifyContent: “center”, fontFamily: “Cinzel”, fontSize: 13, color: “var(–bg-deep)”, fontWeight: 700 }}>{member.character_name[0]}</div>
<span style={{ fontFamily: “Cinzel”, fontSize: 13, color: “var(–gold)” }}>{member.character_name}</span>
<span style={{ fontSize: 11, color: “var(–text-dim)” }}>{member.character_class}</span>
{editing ? <span style={{ display: “inline-flex”, gap: 4, alignItems: “center” }}><input type=“number” min={1} max={20} value={level} onChange={e => setLevel(parseInt(e.target.value) || 1)} style={{ width: 48, padding: “1px 4px”, fontSize: 11 }} /><button onClick={() => { onUpdate(member.id, level); setEditing(false); }} style={{ fontSize: 9, padding: “2px 6px” }}>Save</button><button onClick={() => setEditing(false)} style={{ fontSize: 9, padding: “2px 6px”, background: “none”, border: “none”, color: “var(–text-dim)” }}>✕</button></span>
: <span onClick={() => { setEditing(true); setLevel(member.character_level); }} style={{ fontSize: 11, color: “var(–text-dim)”, cursor: “pointer” }}>Lvl {member.character_level} ✎</span>}
</div>
{confirm ? <span style={{ display: “inline-flex”, gap: 4 }}><button className=“danger” onClick={() => { onRemove(member.id); setConfirm(false); }} style={{ fontSize: 9, padding: “3px 8px” }}>Confirm</button><button onClick={() => setConfirm(false)} style={{ fontSize: 9, padding: “3px 8px” }}>Cancel</button></span>
: <button className=“danger” onClick={() => setConfirm(true)} style={{ fontSize: 10, padding: “4px 10px” }}>Remove</button>}
</div>
);
}

function DeleteBtn({ onDelete }) {
const [confirm, setConfirm] = useState(false);
return confirm ? <div style={{ display: “flex”, gap: 8, alignItems: “center” }}><span style={{ fontSize: 12, color: “var(–crimson-bright)” }}>Delete everything?</span><button className=“danger” onClick={onDelete} style={{ fontSize: 10, padding: “4px 10px” }}>Yes</button><button onClick={() => setConfirm(false)} style={{ fontSize: 10, padding: “4px 10px” }}>Cancel</button></div>
: <button className=“danger” onClick={() => setConfirm(true)} style={{ fontSize: 10, padding: “4px 10px” }}>Delete Party</button>;
}

// ─── MAIN APP ───────────────────────────────────────────────────

export default function App() {
const [role, setRole] = useState(null);
const [party, setParty] = useState(null);
const [player, setPlayer] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
if (!localStorage.getItem(“bastion_client_id”)) localStorage.setItem(“bastion_client_id”, crypto.randomUUID());
const raw = localStorage.getItem(“bastion_session”);
if (raw) {
try {
const s = JSON.parse(raw);
(async () => {
const p = await db.select(“parties”, “id=eq.” + s.partyId);
if (p.length) { setParty(p[0]); setRole(s.role); if (s.role === “player” && s.playerId) { const pl = await db.select(“players”, “id=eq.” + s.playerId); if (pl.length) setPlayer(pl[0]); } }
setLoading(false);
})();
return;
} catch {}
}
setLoading(false);
}, []);

function handleLogin(r, p, pl) { setRole(r); setParty(p); setPlayer(pl); }
function handleLogout() { localStorage.removeItem(“bastion_session”); setRole(null); setParty(null); setPlayer(null); }

if (loading) return <Spinner />;
if (!role || !party) return <LoginScreen onLogin={handleLogin} />;
return <Dashboard party={party} role={role} selectedPlayer={player} onLogout={handleLogout} />;
}