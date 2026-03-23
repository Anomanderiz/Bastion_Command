// ─── DICE UTILITIES ─────────────────────────────────────────────

export function roll(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollMultiple(count, sides) {
  return Array.from({ length: count }, () => roll(sides));
}

// ─── BASTION EVENTS TABLE ───────────────────────────────────────

export const BASTION_EVENTS = [
  { min: 1, max: 50, key: "all_is_well", name: "All Is Well", color: "#4A8B4A" },
  { min: 51, max: 55, key: "attack", name: "Attack", color: "#8B2E2E" },
  { min: 56, max: 58, key: "criminal_hireling", name: "Criminal Hireling", color: "#7B6128" },
  { min: 59, max: 63, key: "extraordinary_opportunity", name: "Extraordinary Opportunity", color: "#5B8DBF" },
  { min: 64, max: 72, key: "friendly_visitors", name: "Friendly Visitors", color: "#4A8B4A" },
  { min: 73, max: 76, key: "guest", name: "Guest", color: "#5B8DBF" },
  { min: 77, max: 79, key: "lost_hirelings", name: "Lost Hirelings", color: "#7B6128" },
  { min: 80, max: 83, key: "magical_discovery", name: "Magical Discovery", color: "#9B6BD4" },
  { min: 84, max: 91, key: "refugees", name: "Refugees", color: "#5B8DBF" },
  { min: 92, max: 98, key: "request_for_aid", name: "Request for Aid", color: "#7B6128" },
  { min: 99, max: 100, key: "treasure", name: "Treasure", color: "#D4A843" },
];

export function getEventFromRoll(d100) {
  return BASTION_EVENTS.find(e => d100 >= e.min && d100 <= e.max);
}

// ─── EVENT DESCRIPTIONS & SUB-ROLLS ─────────────────────────────

export const ALL_IS_WELL_DETAILS = [
  "Accident reports are way down.",
  "The leak in the roof has been fixed.",
  "No vermin infestations to report.",
  "You-Know-Who lost their spectacles again.",
  "One of your hirelings adopted a stray dog.",
  "You received a lovely letter from a friend.",
  "Some practical joker has been putting rotten eggs in people's boots.",
  "Someone thought they saw a ghost.",
];

export const GUEST_TYPES = [
  { roll: 1, desc: "A renowned individual stays 7 days, then gives you a letter of recommendation." },
  { roll: 2, desc: "A person seeking sanctuary from persecution. Departs in 7 days, offers 1d6 × 100 GP." },
  { roll: 3, desc: "A mercenary — one additional Bastion Defender. Stays until dismissed or killed." },
  { roll: 4, desc: "A friendly monster (brass dragon, treant, etc). Defends bastion once if attacked, then leaves." },
];

export const TREASURE_TABLE = [
  { min: 1, max: 40, desc: "25 GP Art Object" },
  { min: 41, max: 63, desc: "250 GP Art Object" },
  { min: 64, max: 73, desc: "750 GP Art Object" },
  { min: 74, max: 75, desc: "2,500 GP Art Object" },
  { min: 76, max: 90, desc: "Common Magic Item (your choice of Arcana, Armaments, Implements, or Relics)" },
  { min: 91, max: 98, desc: "Uncommon Magic Item (your choice of Arcana, Armaments, Implements, or Relics)" },
  { min: 99, max: 100, desc: "Rare Magic Item (your choice of Arcana, Armaments, Implements, or Relics)" },
];

export function getTreasureFromRoll(d100) {
  return TREASURE_TABLE.find(t => d100 >= t.min && d100 <= t.max);
}

// Generate full event resolution text and any mechanical effects
// context: { wallsEnclosed: bool, lieutenants: number }
export function resolveEvent(eventKey, subRolls = {}, context = {}) {
  switch (eventKey) {
    case "all_is_well": {
      const detail = ALL_IS_WELL_DETAILS[(subRolls.d8 || roll(8)) - 1];
      return { summary: "Nothing significant happens.", detail, mechanical: null };
    }
    case "attack": {
      const hasWalls = context.wallsEnclosed || false;
      const lieutenants = context.lieutenants || 0;
      let numDice = hasWalls ? 4 : 6;
      numDice = Math.max(0, numDice - lieutenants);
      const dice = subRolls.attackDice || rollMultiple(numDice, 6);
      const deaths = dice.filter(d => d === 1).length;
      const wallNote = hasWalls ? " Defensive walls reduced dice from 6d6 to 4d6." : "";
      const ltNote = lieutenants > 0 ? ` ${lieutenants} lieutenant${lieutenants > 1 ? "s" : ""} reduced dice by ${lieutenants}.` : "";
      return {
        summary: "A hostile force attacks your Bastion but is defeated.",
        detail: `Rolled ${numDice}d6: [${dice.join(", ")}] — ${deaths} defender${deaths !== 1 ? "s" : ""} killed.${wallNote}${ltNote}`,
        mechanical: { type: "attack", dice, deaths, numDice },
      };
    }
    case "criminal_hireling": {
      const bribe = (subRolls.d6 || roll(6)) * 100;
      return {
        summary: "A hireling's criminal past is discovered. Officials arrive with a warrant.",
        detail: `Bribe cost: ${bribe} GP to retain the hireling. Otherwise they are arrested and replaced next turn.`,
        mechanical: { type: "criminal_hireling", bribe },
      };
    }
    case "extraordinary_opportunity": {
      return {
        summary: "Your Bastion can host a festival, fund research, or appease a noble.",
        detail: "Cost: 500 GP. If you seize the opportunity, roll again on the events table. If you decline, nothing happens.",
        mechanical: { type: "extraordinary_opportunity", cost: 500 },
      };
    }
    case "friendly_visitors": {
      const payment = (subRolls.d6 || roll(6)) * 100;
      return {
        summary: "Friendly visitors want to use one of your special facilities.",
        detail: `They offer ${payment} GP for brief use. It doesn't interrupt your orders.`,
        mechanical: { type: "friendly_visitors", payment },
      };
    }
    case "guest": {
      const guestRoll = subRolls.d4 || roll(4);
      const guest = GUEST_TYPES[guestRoll - 1];
      return {
        summary: "A friendly guest comes to stay at your Bastion.",
        detail: `Guest type (d4 = ${guestRoll}): ${guest.desc}`,
        mechanical: { type: "guest", guestRoll },
      };
    }
    case "lost_hirelings": {
      return {
        summary: "One special facility (random) loses its hirelings.",
        detail: "The facility can't be used next turn. Hirelings are replaced at no cost after that.",
        mechanical: { type: "lost_hirelings" },
      };
    }
    case "magical_discovery": {
      return {
        summary: "Your hirelings discover or create an Uncommon magic item!",
        detail: "It must be a Potion or Scroll of your choice, at no cost.",
        mechanical: { type: "magical_discovery" },
      };
    }
    case "refugees": {
      const count = (subRolls.refugees_d4_1 || roll(4)) + (subRolls.refugees_d4_2 || roll(4));
      const payment = (subRolls.d6 || roll(6)) * 100;
      return {
        summary: `${count} refugees seek shelter in your Bastion.`,
        detail: `They offer ${payment} GP for hospitality. They stay until you find them a home or your Bastion is attacked.`,
        mechanical: { type: "refugees", count, payment },
      };
    }
    case "request_for_aid": {
      return {
        summary: "Local leaders ask for your Bastion's help with a problem.",
        detail: "Dispatch Bastion Defenders. Roll 1d6 per defender sent — total 10+ solves it for 1d6 × 100 GP. Under 10 still solves it but reward is halved and 1 defender dies.",
        mechanical: { type: "request_for_aid" },
      };
    }
    case "treasure": {
      const treasureRoll = subRolls.d100_treasure || roll(100);
      const treasure = getTreasureFromRoll(treasureRoll);
      return {
        summary: "Your Bastion acquires a treasure!",
        detail: `Treasure roll (d100 = ${treasureRoll}): ${treasure.desc}`,
        mechanical: { type: "treasure", treasureRoll, treasure: treasure.desc },
      };
    }
    default:
      return { summary: "Unknown event.", detail: "", mechanical: null };
  }
}
