// ─── DISCORD WEBHOOK (Mortimer the Butler) ──────────────────────
// Set your webhook URL here. Create one in Discord:
// Channel Settings → Integrations → Webhooks → New Webhook → Copy URL

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1405774523130708060/s55Nwt0t2iPlySto7D8fEw5GlhMFh-J4aXM0irAvcVx6GShTpUQSBknd7klCScXqJ9-w";  // ← Paste your webhook URL here

export async function sendToDiscord(message) {
  if (!DISCORD_WEBHOOK_URL) return;

  const formatted = [
    "My noble masters, I write to you of happenings at your bastion:\n",
    message,
    "\nNever you fear for Mortimer is here."
  ].join("\n");

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: formatted,
        username: "Mortimer",
      }),
    });
  } catch (e) {
    console.error("Discord webhook error:", e);
  }
}

// ─── PRE-FORMATTED MESSAGE BUILDERS ─────────────────────────────

export function msgTurnCompleted(charName, bastionName, turnNumber, orders, isMaintain, eventName, eventDetail) {
  const lines = [`**${bastionName}** — Turn ${turnNumber}`];

  if (isMaintain) {
    lines.push(`${charName} issued the **Maintain** order.`);
    if (eventName) {
      lines.push(`🎲 Bastion Event: **${eventName}**`);
      if (eventDetail) lines.push(eventDetail);
    }
  } else if (orders.length > 0) {
    lines.push(`${charName} issued ${orders.length} order${orders.length > 1 ? "s" : ""}:`);
    for (const o of orders) {
      lines.push(`  • **${o.facilityName}** → ${o.orderType}`);
    }
  }

  return lines.join("\n");
}

export function msgFacilityAdded(charName, facilityName, type) {
  if (type === "special") {
    return `⚒️ ${charName} has acquired a new facility: **${facilityName}**!`;
  }
  return `🏗️ ${charName} has begun construction on a new **${facilityName}**.`;
}

export function msgFacilityRemoved(charName, facilityName) {
  return `${charName}'s **${facilityName}** has been decommissioned.`;
}

export function msgBastionCreated(charName, bastionName, description) {
  return `🏰 ${charName} has established a new bastion: **${bastionName}**!${description ? `\n_${description}_` : ""}`;
}

export function msgDefenderRecruited(charName, bastionName, defenderName) {
  return `⚔️ A new defender, **${defenderName}**, has joined the garrison at **${bastionName}**.`;
}

export function msgAttackResult(bastionName, dice, deaths) {
  const diceStr = `[${dice.join(", ")}]`;
  if (deaths === 0) {
    return `**${bastionName}** was attacked! Rolled ${diceStr} — all defenders survived.`;
  }
  return `**${bastionName}** was attacked! Rolled ${diceStr} — **${deaths} defender${deaths > 1 ? "s" : ""} killed**.`;
}

export function msgPlayerRemoved(charName) {
  return `📜 ${charName} has departed the company. Their holdings have been vacated.`;
}
