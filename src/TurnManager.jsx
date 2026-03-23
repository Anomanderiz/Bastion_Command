import { useState, useEffect, useCallback } from "react";
import { db } from "./supabase.js";
import { SPECIAL_FACILITIES, SIZES, SET_COLORS, getMaxSpecialFacilities } from "./data.js";
import { roll, rollMultiple, getEventFromRoll, resolveEvent, BASTION_EVENTS } from "./events.js";
import { sendToDiscord, msgTurnCompleted, msgAttackResult } from "./discord.js";

// ─── ANIMATED DICE ──────────────────────────────────────────────

function DiceRoll({ sides, result, size = 40, color = "var(--gold)" }) {
  const [display, setDisplay] = useState("?");
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    if (result == null) return;
    let frame = 0;
    const interval = setInterval(() => {
      setDisplay(Math.floor(Math.random() * sides) + 1);
      frame++;
      if (frame > 12) {
        clearInterval(interval);
        setDisplay(result);
        setSpinning(false);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [result, sides]);

  return (
    <div style={{
      width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
      background: spinning ? "var(--bg-deep)" : "var(--bg-card)",
      border: `2px solid ${spinning ? "var(--border)" : color}`,
      borderRadius: sides === 100 ? "50%" : 6,
      fontFamily: "Cinzel", fontSize: size * 0.4, fontWeight: 700, color,
      transition: "all 0.3s",
      boxShadow: spinning ? "none" : `0 0 8px ${color}44`,
    }}>
      {display}
    </div>
  );
}

function MultiDice({ count, sides, results, color }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
      {(results || Array(count).fill(null)).map((r, i) => (
        <DiceRoll key={i} sides={sides} result={r} size={36} color={color} />
      ))}
    </div>
  );
}

// ─── EVENT CARD ─────────────────────────────────────────────────

function EventCard({ eventRoll, event, resolution, isNew }) {
  if (!event) return null;
  return (
    <div className={isNew ? "fade-in" : ""} style={{
      background: "var(--bg-card)", border: `1px solid ${event.color}66`,
      borderLeft: `4px solid ${event.color}`, borderRadius: 6, padding: 16, marginTop: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <DiceRoll sides={100} result={eventRoll} size={44} color={event.color} />
        <div>
          <h4 style={{ fontSize: 16, margin: 0, color: event.color }}>{event.name}</h4>
          <p style={{ fontSize: 12, color: "var(--text-dim)" }}>d100 = {eventRoll} ({event.min}–{event.max})</p>
        </div>
      </div>
      {resolution && (
        <>
          <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{resolution.summary}</p>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{resolution.detail}</p>
        </>
      )}
    </div>
  );
}

// ─── ORDER SELECTOR ─────────────────────────────────────────────

function OrderRow({ facility, order, onSetOrder }) {
  const facDef = SPECIAL_FACILITIES.find(sf => sf.key === facility.facility_key);
  if (!facDef) return null;

  const orderType = facDef.order;
  const isOrdered = order != null;

  // Build a brief description of what this order does
  const orderDescs = {
    Craft: "Hirelings craft an item",
    Empower: "Grants a temporary benefit",
    Harvest: "Gathers a resource",
    Recruit: "Recruits creatures or allies",
    Research: "Gathers information",
    Trade: "Buys/sells goods or services",
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      padding: "10px 14px", background: isOrdered ? `${SET_COLORS[facDef.set]}11` : "var(--bg-deep)",
      border: `1px solid ${isOrdered ? SET_COLORS[facDef.set] + "44" : "var(--border)"}`,
      borderRadius: 4, transition: "all 0.2s",
    }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: "Cinzel", fontSize: 13, color: "var(--gold)" }}>{facDef.name}</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 8 }}>
          {orderType} — {orderDescs[orderType] || ""}
        </span>
        {facility.garden_type && <span style={{ fontSize: 10, color: "var(--green)", marginLeft: 6 }}>({facility.garden_type})</span>}
        {facility.training_type && <span style={{ fontSize: 10, color: "var(--blue)", marginLeft: 6 }}>({facility.training_type})</span>}
      </div>
      <button
        onClick={() => onSetOrder(facility.id, isOrdered ? null : orderType)}
        style={{
          fontSize: 10, padding: "5px 12px",
          background: isOrdered ? `${SET_COLORS[facDef.set]}33` : "var(--bg-card)",
          borderColor: isOrdered ? SET_COLORS[facDef.set] : "var(--border)",
          color: isOrdered ? SET_COLORS[facDef.set] : "var(--text-dim)",
        }}
      >
        {isOrdered ? `✓ ${orderType}` : `Issue ${orderType}`}
      </button>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "Cinzel", fontSize: 14, color: "var(--gold)" }}>Turn {turn.turn_number}</span>
          {turn.in_game_date && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{turn.in_game_date}</span>}
          {turn.is_maintain && (
            <span className="badge" style={{ background: "var(--bg-deep)", color: "var(--text-dim)", border: "1px solid var(--border)", fontSize: 9 }}>Maintain</span>
          )}
          {event && (
            <span className="badge" style={{ background: event.color + "22", color: event.color, border: `1px solid ${event.color}44`, fontSize: 9 }}>{event.name}</span>
          )}
          {!turn.is_maintain && orders.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{expanded ? "▾" : "▸"}</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }} className="fade-in">
          {orders.length > 0 && !turn.is_maintain && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase" }}>Orders:</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {orders.map((o, i) => {
                  const facDef = SPECIAL_FACILITIES.find(sf => sf.key === o.facility_key);
                  return (
                    <span key={i} className="badge" style={{ background: "var(--bg-deep)", color: "var(--gold)", border: "1px solid var(--border-gold)", fontSize: 10 }}>
                      {facDef?.name || o.facility_key}: {o.order_type}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {turn.event_type && turn.event_details && (
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{turn.event_details}</p>
          )}
          {turn.notes && <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, fontStyle: "italic" }}>{turn.notes}</p>}
        </div>
      )}
    </div>
  );
}

// ─── MAIN TURN MANAGER ─────────────────────────────────────────

export default function TurnManager({ bastion, facilities, defenders, player, showToast, onReload }) {
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  // New turn state
  const [isTakingTurn, setIsTakingTurn] = useState(false);
  const [turnMode, setTurnMode] = useState(null); // 'orders' or 'maintain'
  const [facilityOrders, setFacilityOrders] = useState({});
  const [inGameDate, setInGameDate] = useState("");
  const [turnNotes, setTurnNotes] = useState("");
  // Event state
  const [eventRoll, setEventRoll] = useState(null);
  const [event, setEvent] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [showEvent, setShowEvent] = useState(false);
  // Aid dispatching
  const [aidDefenders, setAidDefenders] = useState(0);
  const [aidResolved, setAidResolved] = useState(null);

  const specialFacs = (facilities || []).filter(f => f.facility_type === "special");
  const aliveDefenders = (defenders || []).filter(d => d.is_alive);

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

  function startTurn() {
    setIsTakingTurn(true);
    setTurnMode(null);
    setFacilityOrders({});
    setEventRoll(null);
    setEvent(null);
    setResolution(null);
    setShowEvent(false);
    setTurnNotes("");
    setAidDefenders(0);
    setAidResolved(null);
  }

  function setOrder(facilityId, orderType) {
    setFacilityOrders(prev => {
      const next = { ...prev };
      if (orderType === null) {
        delete next[facilityId];
      } else {
        next[facilityId] = orderType;
      }
      return next;
    });
  }

  function rollEvent() {
    const d100 = roll(100);
    const evt = getEventFromRoll(d100);
    const res = resolveEvent(evt.key);
    setEventRoll(d100);
    setEvent(evt);
    setResolution(res);
    setShowEvent(true);
  }

  function resolveAid(numDefenders) {
    const dice = rollMultiple(numDefenders, 6);
    const total = dice.reduce((a, b) => a + b, 0);
    const success = total >= 10;
    const rewardRoll = roll(6) * 100;
    const reward = success ? rewardRoll : Math.floor(rewardRoll / 2);
    const defenderDied = !success;
    setAidResolved({ dice, total, success, reward, defenderDied });
  }

  async function completeTurn() {
    const isMaintain = turnMode === "maintain";
    const orders = [];
    if (!isMaintain) {
      for (const [facId, orderType] of Object.entries(facilityOrders)) {
        const fac = facilities.find(f => f.id === facId);
        if (fac) {
          orders.push({ facility_id: facId, facility_key: fac.facility_key, order_type: orderType });
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
        if (aliveDefenders[i]) {
          await db.update("defenders", { id: aliveDefenders[i].id }, { is_alive: false });
        }
      }
    }

    // Handle aid defender death
    if (aidResolved?.defenderDied && aliveDefenders.length > 0) {
      await db.update("defenders", { id: aliveDefenders[aliveDefenders.length - 1].id }, { is_alive: false });
    }

    await db.insert("bastion_turns", {
      bastion_id: bastion.id,
      turn_number: nextTurnNumber,
      in_game_date: inGameDate || null,
      is_maintain: isMaintain,
      orders: isMaintain ? [] : orders,
      event_roll: isMaintain ? eventRoll : null,
      event_type: isMaintain && event ? event.key : null,
      event_details: eventDetails || null,
      notes: turnNotes || null,
    });

    showToast(`Turn ${nextTurnNumber} completed!`);
    setIsTakingTurn(false);
    loadTurns();
    onReload();

    // Discord webhook
    const discordOrders = orders.map(o => {
      const facDef = SPECIAL_FACILITIES.find(sf => sf.key === o.facility_key);
      return { facilityName: facDef?.name || o.facility_key, orderType: o.order_type };
    });
    let attackDetail = "";
    if (resolution?.mechanical?.type === "attack") {
      attackDetail = msgAttackResult(bastion.name, resolution.mechanical.dice, resolution.mechanical.deaths);
    }
    const eventDetailForDiscord = isMaintain && resolution
      ? `${resolution.summary}${attackDetail ? "\n" + attackDetail : (resolution.detail ? "\n" + resolution.detail : "")}`
      : "";
    sendToDiscord(msgTurnCompleted(
      player.character_name, bastion.name, nextTurnNumber,
      discordOrders, isMaintain,
      event?.name || null,
      eventDetailForDiscord
    ));
  }

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>;
  }

  if (!bastion) {
    return <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>Create your Bastion first.</p>;
  }

  return (
    <div>
      {/* Taking a Turn */}
      {!isTakingTurn ? (
        <div className="card" style={{ marginBottom: 20, textAlign: "center", borderColor: "var(--border-gold)" }}>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>Bastion Turn {nextTurnNumber}</h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>
            {specialFacs.length === 0
              ? "You need at least one special facility before taking a turn."
              : "Issue orders to your facilities, or issue the Maintain order to the whole Bastion."}
          </p>
          <button className="primary" onClick={startTurn} disabled={specialFacs.length === 0}
            style={{ padding: "10px 30px" }}>
            Begin Turn
          </button>
        </div>
      ) : (
        <div className="fade-in">
          {/* Turn header */}
          <div className="card" style={{ marginBottom: 16, borderColor: "var(--gold-dim)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>Turn {nextTurnNumber}</h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={inGameDate} onChange={e => setInGameDate(e.target.value)}
                  placeholder="In-game date (optional)" style={{ padding: "4px 8px", fontSize: 12, width: 180 }} />
                <button onClick={() => { setIsTakingTurn(false); }} style={{ fontSize: 10, padding: "4px 10px", color: "var(--text-dim)", borderColor: "var(--border)" }}>Cancel</button>
              </div>
            </div>
          </div>

          {/* Choose mode */}
          {!turnMode && (
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer", borderColor: "var(--border-gold)" }}
                onClick={() => setTurnMode("orders")}>
                <h4 style={{ fontSize: 14, marginBottom: 6 }}>Issue Orders</h4>
                <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  Choose orders for each special facility individually. No event roll.
                </p>
              </div>
              <div className="card" style={{ flex: 1, textAlign: "center", cursor: "pointer", borderColor: "var(--crimson)" }}
                onClick={() => { setTurnMode("maintain"); rollEvent(); }}>
                <h4 style={{ fontSize: 14, marginBottom: 6, color: "var(--crimson-bright)" }}>Maintain</h4>
                <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  All hirelings maintain the Bastion. Triggers a Bastion Event roll (d100).
                </p>
              </div>
            </div>
          )}

          {/* Orders mode */}
          {turnMode === "orders" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>
                Select which facilities should execute their order this turn. You don't have to order all of them.
              </p>
              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {specialFacs.map(f => (
                  <OrderRow key={f.id} facility={f} order={facilityOrders[f.id] || null} onSetOrder={setOrder} />
                ))}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Notes</label>
                <textarea value={turnNotes} onChange={e => setTurnNotes(e.target.value)}
                  placeholder="What happened this turn? Any details to remember..."
                  style={{ width: "100%", marginTop: 4, minHeight: 50, resize: "vertical", fontSize: 13 }} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="primary" onClick={completeTurn}
                  disabled={Object.keys(facilityOrders).length === 0}
                  style={{ padding: "10px 24px" }}>
                  Complete Turn ({Object.keys(facilityOrders).length} order{Object.keys(facilityOrders).length !== 1 ? "s" : ""})
                </button>
                <button onClick={() => setTurnMode(null)} style={{ fontSize: 11, color: "var(--text-dim)" }}>← Back</button>
              </div>
            </div>
          )}

          {/* Maintain mode */}
          {turnMode === "maintain" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>
                All hirelings are maintaining the Bastion. A Bastion Event has been rolled:
              </p>

              {showEvent && event && (
                <EventCard eventRoll={eventRoll} event={event} resolution={resolution} isNew />
              )}

              {/* Attack — show defender dice */}
              {resolution?.mechanical?.type === "attack" && (
                <div style={{ marginTop: 12, padding: 14, background: "var(--bg-deep)", borderRadius: 6, border: "1px solid var(--crimson)44" }}>
                  <p style={{ fontSize: 13, color: "var(--crimson-bright)", marginBottom: 8 }}>Attack Dice (6d6 — each 1 kills a defender):</p>
                  <MultiDice count={6} sides={6} results={resolution.mechanical.dice} color="var(--crimson-bright)" />
                  <p style={{ fontSize: 13, color: "var(--text)", marginTop: 8 }}>
                    {resolution.mechanical.deaths === 0
                      ? "All defenders survived!"
                      : `${resolution.mechanical.deaths} defender${resolution.mechanical.deaths > 1 ? "s" : ""} killed. (You have ${aliveDefenders.length} alive.)`}
                  </p>
                </div>
              )}

              {/* Request for Aid — dispatch UI */}
              {resolution?.mechanical?.type === "request_for_aid" && !aidResolved && (
                <div style={{ marginTop: 12, padding: 14, background: "var(--bg-deep)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 8 }}>
                    How many defenders do you dispatch? (You have {aliveDefenders.length})
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" min={0} max={aliveDefenders.length} value={aidDefenders}
                      onChange={e => setAidDefenders(Math.min(parseInt(e.target.value) || 0, aliveDefenders.length))}
                      style={{ width: 60, padding: "4px 8px", fontSize: 13 }} />
                    <button className="primary" onClick={() => resolveAid(aidDefenders)} disabled={aidDefenders === 0}
                      style={{ fontSize: 11, padding: "6px 14px" }}>
                      Send {aidDefenders} Defender{aidDefenders !== 1 ? "s" : ""}
                    </button>
                    <button onClick={() => setAidResolved({ skipped: true })} style={{ fontSize: 11, padding: "6px 14px", color: "var(--text-dim)" }}>
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Aid resolution */}
              {aidResolved && !aidResolved.skipped && (
                <div style={{ marginTop: 12, padding: 14, background: "var(--bg-deep)", borderRadius: 6, border: "1px solid var(--border)" }} className="fade-in">
                  <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 6 }}>
                    Rolled {aidResolved.dice.length}d6: [{aidResolved.dice.join(", ")}] = {aidResolved.total}
                  </p>
                  <MultiDice count={aidResolved.dice.length} sides={6} results={aidResolved.dice} color={aidResolved.success ? "var(--green)" : "var(--crimson-bright)"} />
                  <p style={{ fontSize: 13, color: aidResolved.success ? "var(--green)" : "var(--crimson-bright)", marginTop: 8 }}>
                    {aidResolved.success
                      ? `Success! Problem solved. Reward: ${aidResolved.reward} GP.`
                      : `Problem solved, but reward halved to ${aidResolved.reward} GP and 1 defender died.`}
                  </p>
                </div>
              )}

              <div style={{ marginTop: 16, marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Cinzel", textTransform: "uppercase", letterSpacing: 1 }}>Notes</label>
                <textarea value={turnNotes} onChange={e => setTurnNotes(e.target.value)}
                  placeholder="DM rulings, player decisions, narrative details..."
                  style={{ width: "100%", marginTop: 4, minHeight: 50, resize: "vertical", fontSize: 13 }} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="primary" onClick={completeTurn} style={{ padding: "10px 24px" }}>
                  Complete Turn
                </button>
                {resolution?.mechanical?.type === "extraordinary_opportunity" && !eventRoll && (
                  <button onClick={rollEvent} style={{ fontSize: 11, padding: "6px 14px" }}>
                    Seize Opportunity — Re-roll Event
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Turn History */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Turn History</h3>
        {turns.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>No turns taken yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {turns.map(t => <TurnEntry key={t.id} turn={t} />)}
          </div>
        )}
      </div>

      {/* Event Reference */}
      <div style={{ marginTop: 24 }}>
        <details>
          <summary style={{ cursor: "pointer", fontFamily: "Cinzel", fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>
            Bastion Events Reference Table
          </summary>
          <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
            {BASTION_EVENTS.map(e => (
              <div key={e.key} style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 0", fontSize: 12 }}>
                <span style={{ width: 55, color: "var(--text-dim)", fontFamily: "monospace" }}>
                  {String(e.min).padStart(2, "0")}–{String(e.max).padStart(2, "0")}
                </span>
                <span style={{ color: e.color, fontFamily: "Cinzel", fontSize: 11 }}>{e.name}</span>
                <span style={{ color: "var(--text-dim)" }}>
                  ({e.max - e.min + 1}%)
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
