import { useState, useEffect, useCallback } from "react";
import { db } from "./supabase.js";
import { SPECIAL_FACILITIES, SIZES, SET_COLORS, ORDER_OPTIONS, getMaxSpecialFacilities } from "./data.js";
import { roll, rollMultiple, getEventFromRoll, resolveEvent, BASTION_EVENTS } from "./events.js";
import { sendToDiscord, msgTurnCompleted, msgAttackResult } from "./discord.js";

// ─── ANIMATED DICE ──────────────────────────────────────────────

function DiceRoll({ sides, result, size = 40, color = "var(--gold)" }) {
  const [display, setDisplay] = useState("?");
  const [spinning, setSpinning] = useState(true);
  useEffect(() => {
    if (result == null) return;
    let frame = 0;
    const interval = setInterval(() => { setDisplay(Math.floor(Math.random() * sides) + 1); frame++; if (frame > 12) { clearInterval(interval); setDisplay(result); setSpinning(false); } }, 60);
    return () => clearInterval(interval);
  }, [result, sides]);
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: spinning ? "var(--bg-deep)" : "var(--bg-card)", border: `2px solid ${spinning ? "var(--border)" : color}`, borderRadius: sides === 100 ? "50%" : 6, fontFamily: "Cinzel", fontSize: size * 0.4, fontWeight: 700, color, transition: "all 0.3s", boxShadow: spinning ? "none" : `0 0 8px ${color}44` }}>{display}</div>
  );
}

function MultiDice({ count, sides, results, color }) {
  return <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>{(results || Array(count).fill(null)).map((r, i) => <DiceRoll key={i} sides={sides} result={r} size={36} color={color} />)}</div>;
}

// ─── EVENT CARD ─────────────────────────────────────────────────

function EventCard({ eventRoll, event, resolution, isNew }) {
  if (!event) return null;
  return (
    <div className={isNew ? "fade-in" : ""} style={{ background: "var(--bg-card)", border: `1px solid ${event.color}66`, borderLeft: `4px solid ${event.color}`, borderRadius: 6, padding: 16, marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <DiceRoll sides={100} result={eventRoll} size={44} color={event.color} />
        <div>
          <h4 style={{ fontSize: 16, margin: 0, color: event.color }}>{event.name}</h4>
          <p style={{ fontSize: 12, color: "var(--text-dim)" }}>d100 = {eventRoll} ({event.min}–{event.max})</p>
        </div>
      </div>
      {resolution && <>
        <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{resolution.summary}</p>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{resolution.detail}</p>
      </>}
    </div>
  );
}

// ─── ORDER SELECTOR ─────────────────────────────────────────────

function OrderRow({ facility, selectedOrder, onSetOrder, playerLevel }) {
  const facDef = SPECIAL_FACILITIES.find(sf => sf.key === facility.facility_key);
  if (!facDef) return null;
  const options = ORDER_OPTIONS[facility.facility_key] || [];
  const isBusy = facility.order_status && facility.order_progress < facility.order_duration;
  const isOrdered = selectedOrder != null;

  return (
    <div style={{ padding: "10px 14px", background: isBusy ? "var(--bg-hover)" : isOrdered ? `${SET_COLORS[facDef.set]}11` : "var(--bg-deep)", border: `1px solid ${isBusy ? "var(--gold-dim)" : isOrdered ? SET_COLORS[facDef.set] + "44" : "var(--border)"}`, borderRadius: 4, transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Cinzel", fontSize: 13, color: "var(--gold)" }}>{facDef.name}</span>
        {isBusy ? (
          <span style={{ fontSize: 11, color: "var(--gold-dim)" }}>⏳ {facility.order_status} ({facility.order_progress}/{facility.order_duration}d)</span>
        ) : options.length > 0 ? (
          <select value={selectedOrder || ""} onChange={e => onSetOrder(facility.id, e.target.value || null)} style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 3, maxWidth: 260 }}>
            <option value="">— No order —</option>
            {options.filter(o => !o.minLevel || playerLevel >= o.minLevel).map(o => (
              <option key={o.name} value={o.name}>{o.name} ({o.duration}d{o.cost ? ", " + o.cost + " GP" : ""})</option>
            ))}
          </select>
        ) : (
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>No orders available</span>
        )}
      </div>
      {isBusy && (
        <div style={{ marginTop: 6 }}>
          <div style={{ height: 6, background: "var(--bg-deep)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(facility.order_progress / facility.order_duration) * 100}%`, background: "var(--gold)", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TURN HISTORY ENTRY ─────────────────────────────────────────

function TurnEntry({ turn }) {
  const [expanded, setExpanded] = useState(false);
  const orders = turn.orders || [];
  const event = turn.event_type ? BASTION_EVENTS.find(e => e.key === turn.event_type) : null;
  return (
    <div className="card" style={{ padding: "10px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "Cinzel", fontSize: 14, color: "var(--gold)" }}>Turn {turn.turn_number}</span>
          {turn.in_game_date && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Day {turn.in_game_date}</span>}
          {turn.is_maintain && <span className="badge" style={{ background: "var(--bg-deep)", color: "var(--text-dim)", border: "1px solid var(--border)", fontSize: 9 }}>Maintain</span>}
          {event && <span className="badge" style={{ background: event.color + "22", color: event.color, border: `1px solid ${event.color}44`, fontSize: 9 }}>{event.name}</span>}
          {!turn.is_maintain && orders.length > 0 && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{expanded ? "▾" : "▸"}</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }} className="fade-in">
          {orders.length > 0 && !turn.is_maintain && <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase" }}>Orders:</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>{orders.map((o, i) => { const fd = SPECIAL_FACILITIES.find(sf => sf.key === o.facility_key); return <span key={i} className="badge" style={{ background: "var(--bg-deep)", color: "var(--gold)", border: "1px solid var(--border-gold)", fontSize: 10 }}>{fd?.name || o.facility_key}: {o.order_type}</span>; })}</div>
          </div>}
          {turn.event_type && turn.event_details && <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{turn.event_details}</p>}
          {turn.notes && <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, fontStyle: "italic" }}>{turn.notes}</p>}
        </div>
      )}
    </div>
  );
}

// ─── ACTIVE ORDERS DISPLAY ──────────────────────────────────────

function ActiveOrders({ facilities }) {
  const active = facilities.filter(f => f.order_status && f.order_progress < f.order_duration);
  if (active.length === 0) return null;
  return (
    <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold-dim)" }}>
      <h4 style={{ fontSize: 13, marginBottom: 10 }}>Active Orders</h4>
      <div style={{ display: "grid", gap: 8 }}>
        {active.map(f => {
          const def = SPECIAL_FACILITIES.find(sf => sf.key === f.facility_key);
          const pct = f.order_duration > 0 ? (f.order_progress / f.order_duration) * 100 : 0;
          return (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "Cinzel", fontSize: 12, color: "var(--gold)", minWidth: 120 }}>{def?.name || f.facility_key}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>
                  <span>{f.order_status}</span>
                  <span>{f.order_progress}/{f.order_duration}d</span>
                </div>
                <div style={{ height: 6, background: "var(--bg-deep)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--green)" : "var(--gold)", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN TURN MANAGER ─────────────────────────────────────────

export default function TurnManager({ bastion, facilities, defenders, player, showToast, onReload, readOnly, party, onUpdateParty }) {
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTakingTurn, setIsTakingTurn] = useState(false);
  const [turnMode, setTurnMode] = useState(null);
  const [facilityOrders, setFacilityOrders] = useState({});
  const [turnNotes, setTurnNotes] = useState("");
  const [eventRoll, setEventRoll] = useState(null);
  const [event, setEvent] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [showEvent, setShowEvent] = useState(false);
  const [aidDefenders, setAidDefenders] = useState(0);
  const [aidResolved, setAidResolved] = useState(null);
  const [advancing, setAdvancing] = useState(false);

  const specialFacs = (facilities || []).filter(f => f.facility_type === "special");
  const aliveDefenders = (defenders || []).filter(d => d.is_alive);
  const currentDay = party?.current_day || 1;

  const loadTurns = useCallback(async () => {
    if (!bastion) { setLoading(false); return; }
    try {
      const t = await db.select("bastion_turns", `bastion_id=eq.${bastion.id}&order=turn_number.desc&limit=50`);
      setTurns(t);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [bastion?.id]);

  useEffect(() => { loadTurns(); }, [loadTurns]);

  const nextTurnNumber = turns.length > 0 ? Math.max(...turns.map(t => t.turn_number)) + 1 : 1;

  // ─── TIME ADVANCEMENT ───────────────────────────────────────
  async function advanceTime(days) {
    setAdvancing(true);
    const completedOrders = [];

    for (const fac of facilities) {
      if (!fac.order_status || fac.order_progress >= fac.order_duration) continue;
      const newProgress = Math.min(fac.order_progress + days, fac.order_duration);
      const completed = newProgress >= fac.order_duration;

      if (completed) {
        // Check if this was an enlargement
        if (fac.order_status.startsWith("Enlarging to ")) {
          const targetSize = fac.order_status.split(" ").pop().toLowerCase();
          await db.update("facilities", { id: fac.id }, { order_status: null, order_progress: 0, order_duration: 0, size: targetSize });
        } else {
          await db.update("facilities", { id: fac.id }, { order_status: null, order_progress: 0, order_duration: 0 });
        }
        const def = SPECIAL_FACILITIES.find(sf => sf.key === fac.facility_key);
        completedOrders.push(`${def?.name || fac.facility_key}: ${fac.order_status}`);
      } else {
        await db.update("facilities", { id: fac.id }, { order_progress: newProgress });
      }
    }

    const newDay = currentDay + days;
    await db.update("parties", { id: party.id }, { current_day: newDay });
    if (onUpdateParty) onUpdateParty({ ...party, current_day: newDay });

    if (completedOrders.length > 0) {
      const msg = `⏰ Day ${newDay}: ${completedOrders.length} order${completedOrders.length > 1 ? "s" : ""} completed — ${completedOrders.join(", ")}`;
      sendToDiscord(msg);
      showToast(`${completedOrders.length} order(s) completed!`);
    } else {
      showToast(`Advanced to Day ${newDay}`);
    }

    setAdvancing(false);
    onReload();
    loadTurns();
  }

  // ─── TURN ACTIONS ───────────────────────────────────────────
  function startTurn() {
    setIsTakingTurn(true); setTurnMode(null); setFacilityOrders({}); setEventRoll(null);
    setEvent(null); setResolution(null); setShowEvent(false); setTurnNotes("");
    setAidDefenders(0); setAidResolved(null);
  }

  function setOrder(facilityId, orderName) {
    setFacilityOrders(prev => {
      const next = { ...prev };
      if (!orderName) { delete next[facilityId]; } else { next[facilityId] = orderName; }
      return next;
    });
  }

  function rollEvent() {
    const d100 = roll(100);
    const evt = getEventFromRoll(d100);
    const ctx = { wallsEnclosed: bastion?.walls_fully_enclosed || false, lieutenants: 0 };
    const res = resolveEvent(evt.key, {}, ctx);
    setEventRoll(d100); setEvent(evt); setResolution(res); setShowEvent(true);
  }

  function resolveAid(numDef) {
    const dice = rollMultiple(numDef, 6);
    const total = dice.reduce((a, b) => a + b, 0);
    const success = total >= 10;
    const rewardRoll = roll(6) * 100;
    setAidResolved({ dice, total, success, reward: success ? rewardRoll : Math.floor(rewardRoll / 2), defenderDied: !success });
  }

  async function completeTurn() {
    const isMaintain = turnMode === "maintain";
    const orders = [];

    if (!isMaintain) {
      for (const [facId, orderName] of Object.entries(facilityOrders)) {
        const fac = facilities.find(f => f.id === facId);
        if (!fac) continue;
        const opts = ORDER_OPTIONS[fac.facility_key] || [];
        const opt = opts.find(o => o.name === orderName);
        orders.push({ facility_id: facId, facility_key: fac.facility_key, order_type: orderName });
        // Start order tracking on the facility
        if (opt) {
          await db.update("facilities", { id: facId }, { order_status: orderName, order_progress: 0, order_duration: opt.duration });
        }
      }
    }

    let eventDetails = "";
    if (isMaintain && resolution) {
      eventDetails = `${resolution.summary} ${resolution.detail}`;
    }

    // Handle attack deaths
    if (resolution?.mechanical?.type === "attack" && resolution.mechanical.deaths > 0) {
      const toKill = Math.min(resolution.mechanical.deaths, aliveDefenders.length);
      for (let i = 0; i < toKill; i++) {
        if (aliveDefenders[i]) await db.update("defenders", { id: aliveDefenders[i].id }, { is_alive: false });
      }
    }

    // Handle aid defender death
    if (aidResolved?.defenderDied && aliveDefenders.length > 0) {
      await db.update("defenders", { id: aliveDefenders[aliveDefenders.length - 1].id }, { is_alive: false });
    }

    await db.insert("bastion_turns", {
      bastion_id: bastion.id, turn_number: nextTurnNumber, in_game_date: String(currentDay),
      is_maintain: isMaintain, orders: isMaintain ? [] : orders,
      event_roll: isMaintain ? eventRoll : null, event_type: isMaintain && event ? event.key : null,
      event_details: eventDetails || null, notes: turnNotes || null,
    });

    showToast(`Turn ${nextTurnNumber} completed!`);
    setIsTakingTurn(false); loadTurns(); onReload();

    // Discord
    const discordOrders = orders.map(o => { const fd = SPECIAL_FACILITIES.find(sf => sf.key === o.facility_key); return { facilityName: fd?.name || o.facility_key, orderType: o.order_type }; });
    let attackDetail = "";
    if (resolution?.mechanical?.type === "attack") attackDetail = msgAttackResult(bastion.name, resolution.mechanical.dice, resolution.mechanical.deaths);
    const eventForDiscord = isMaintain && resolution ? `${resolution.summary}${attackDetail ? "\n" + attackDetail : resolution.detail ? "\n" + resolution.detail : ""}` : "";
    sendToDiscord(msgTurnCompleted(player?.character_name || "Unknown", bastion?.name || "Bastion", nextTurnNumber, discordOrders, isMaintain, event?.name || null, eventForDiscord));
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>;
  if (!bastion) return <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>Create a Bastion first.</p>;

  return (
    <div>
      {/* ── TIME TRACKER (DM only) ── */}
      {!readOnly && (
        <div className="card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, borderColor: "var(--border-gold)" }}>
          <div>
            <span style={{ fontFamily: "Cinzel", fontSize: 14, color: "var(--gold)" }}>Campaign Day {currentDay}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => advanceTime(1)} disabled={advancing} style={{ fontSize: 11, padding: "6px 14px" }}>+1 Day</button>
            <button onClick={() => advanceTime(7)} disabled={advancing} style={{ fontSize: 11, padding: "6px 14px" }}>+7 Days</button>
            {advancing && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Advancing...</span>}
          </div>
        </div>
      )}

      {/* Read-only day display for players */}
      {readOnly && (
        <div className="card" style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: "Cinzel", fontSize: 14, color: "var(--gold)" }}>Campaign Day {currentDay}</span>
        </div>
      )}

      {/* ── ACTIVE ORDERS ── */}
      <ActiveOrders facilities={facilities} />

      {/* ── TAKE A TURN (DM only) ── */}
      {!readOnly && (!isTakingTurn ? (
        <div className="card" style={{ marginBottom: 20, textAlign: "center", borderColor: "var(--border-gold)" }}>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>Bastion Turn {nextTurnNumber}</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>
            {specialFacs.length === 0 ? "Need at least one special facility." : "Issue orders or maintain the bastion."}
          </p>
          <button className="primary" onClick={startTurn} disabled={specialFacs.length === 0} style={{ padding: "10px 30px" }}>Begin Turn</button>
        </div>
      ) : (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold-dim)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>Turn {nextTurnNumber} — Day {currentDay}</h3>
            <button onClick={() => setIsTakingTurn(false)} style={{ fontSize: 10, padding: "4px 10px", color: "var(--text-dim)", borderColor: "var(--border)" }}>Cancel</button>
          </div>

          {/* Choose mode */}
          {!turnMode && (
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer", borderColor: "var(--border-gold)" }} onClick={() => setTurnMode("orders")}>
                <h4 style={{ fontSize: 14, marginBottom: 6 }}>Issue Orders</h4>
                <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Choose orders for each facility. No event roll.</p>
              </div>
              <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer", borderColor: "var(--crimson)" }} onClick={() => { setTurnMode("maintain"); rollEvent(); }}>
                <h4 style={{ fontSize: 14, marginBottom: 6, color: "var(--crimson-bright)" }}>Maintain</h4>
                <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Hirelings maintain the Bastion. Triggers event roll.</p>
              </div>
            </div>
          )}

          {/* Orders mode */}
          {turnMode === "orders" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>Select orders for facilities. Busy facilities will continue their current order.</p>
              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {specialFacs.map(f => <OrderRow key={f.id} facility={f} selectedOrder={facilityOrders[f.id] || null} onSetOrder={setOrder} playerLevel={player?.character_level || 5} />)}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Notes</label>
                <textarea value={turnNotes} onChange={e => setTurnNotes(e.target.value)} placeholder="What happened this turn?" style={{ width: "100%", marginTop: 4, minHeight: 50, resize: "vertical", fontSize: 13 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="primary" onClick={completeTurn} disabled={Object.keys(facilityOrders).length === 0} style={{ padding: "10px 24px" }}>Complete Turn ({Object.keys(facilityOrders).length} order{Object.keys(facilityOrders).length !== 1 ? "s" : ""})</button>
                <button onClick={() => setTurnMode(null)} style={{ fontSize: 11, color: "var(--text-dim)" }}>← Back</button>
              </div>
            </div>
          )}

          {/* Maintain mode */}
          {turnMode === "maintain" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>All hirelings maintaining. Event rolled:</p>
              {showEvent && event && <EventCard eventRoll={eventRoll} event={event} resolution={resolution} isNew />}

              {resolution?.mechanical?.type === "attack" && (
                <div style={{ marginTop: 12, padding: 14, background: "var(--bg-deep)", borderRadius: 6, border: "1px solid var(--crimson)44" }}>
                  <p style={{ fontSize: 13, color: "var(--crimson-bright)", marginBottom: 8 }}>Attack Dice ({resolution.mechanical.numDice || 6}d6):</p>
                  <MultiDice count={resolution.mechanical.dice.length} sides={6} results={resolution.mechanical.dice} color="var(--crimson-bright)" />
                  <p style={{ fontSize: 13, color: "var(--text)", marginTop: 8 }}>{resolution.mechanical.deaths === 0 ? "All defenders survived!" : `${resolution.mechanical.deaths} defender${resolution.mechanical.deaths > 1 ? "s" : ""} killed.`}</p>
                </div>
              )}

              {resolution?.mechanical?.type === "request_for_aid" && !aidResolved && (
                <div style={{ marginTop: 12, padding: 14, background: "var(--bg-deep)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 8 }}>Dispatch defenders? ({aliveDefenders.length} available)</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" min={0} max={aliveDefenders.length} value={aidDefenders} onChange={e => setAidDefenders(Math.min(parseInt(e.target.value) || 0, aliveDefenders.length))} style={{ width: 60, padding: "4px 8px", fontSize: 13 }} />
                    <button className="primary" onClick={() => resolveAid(aidDefenders)} disabled={aidDefenders === 0} style={{ fontSize: 11, padding: "6px 14px" }}>Send</button>
                    <button onClick={() => setAidResolved({ skipped: true })} style={{ fontSize: 11, padding: "6px 14px", color: "var(--text-dim)" }}>Decline</button>
                  </div>
                </div>
              )}

              {aidResolved && !aidResolved.skipped && (
                <div style={{ marginTop: 12, padding: 14, background: "var(--bg-deep)", borderRadius: 6, border: "1px solid var(--border)" }} className="fade-in">
                  <MultiDice count={aidResolved.dice.length} sides={6} results={aidResolved.dice} color={aidResolved.success ? "var(--green)" : "var(--crimson-bright)"} />
                  <p style={{ fontSize: 13, color: aidResolved.success ? "var(--green)" : "var(--crimson-bright)", marginTop: 8 }}>{aidResolved.success ? `Success! Reward: ${aidResolved.reward} GP.` : `Solved, but reward halved to ${aidResolved.reward} GP and 1 defender died.`}</p>
                </div>
              )}

              <div style={{ marginTop: 16, marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Notes</label>
                <textarea value={turnNotes} onChange={e => setTurnNotes(e.target.value)} placeholder="DM rulings, narrative..." style={{ width: "100%", marginTop: 4, minHeight: 50, resize: "vertical", fontSize: 13 }} />
              </div>
              <button className="primary" onClick={completeTurn} style={{ padding: "10px 24px" }}>Complete Turn</button>
            </div>
          )}
        </div>
      )
      )}

      {/* ── TURN HISTORY ── */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Turn History</h3>
        {turns.length === 0 ? <p style={{ color: "var(--text-dim)", fontSize: 13 }}>No turns yet.</p> : (
          <div style={{ display: "grid", gap: 8 }}>{turns.map(t => <TurnEntry key={t.id} turn={t} />)}</div>
        )}
      </div>

      {/* ── EVENTS REFERENCE ── */}
      <div style={{ marginTop: 24 }}>
        <details>
          <summary style={{ cursor: "pointer", fontFamily: "Cinzel", fontSize: 13, color: "var(--text-dim)" }}>Bastion Events Reference</summary>
          <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
            {BASTION_EVENTS.map(e => (
              <div key={e.key} style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 0", fontSize: 12 }}>
                <span style={{ width: 55, color: "var(--text-dim)", fontFamily: "monospace" }}>{String(e.min).padStart(2, "0")}–{String(e.max).padStart(2, "0")}</span>
                <span style={{ color: e.color, fontFamily: "Cinzel", fontSize: 11 }}>{e.name}</span>
                <span style={{ color: "var(--text-dim)" }}>({e.max - e.min + 1}%)</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
