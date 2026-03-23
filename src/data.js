export const CLASSES = [
  "Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin",
  "Ranger","Rogue","Sorcerer","Warlock","Wizard","Artificer","Blood Hunter"
];

export const AVATAR_COLORS = [
  "#D4A843","#8B2E2E","#2E5E4E","#4A3B6B","#6B4226","#1E3A5F",
  "#5C1A1A","#2B4C3F","#7B6128","#3D2C5E","#1F4F4F","#6E3630"
];

export const SIZES = {
  cramped: { label: "Cramped", squares: 4 },
  roomy: { label: "Roomy", squares: 16 },
  vast: { label: "Vast", squares: 36 },
};

export const BASIC_FACILITIES = ["Bedroom","Courtyard","Dining Room","Kitchen","Parlor","Storage"];

export const ORDER_TYPES = ["Craft","Empower","Harvest","Maintain","Recruit","Research","Trade"];

export const SET_LABELS = { core: "Core", fr: "Forgotten Realms", eberron: "Eberron" };
export const SET_COLORS = { core: "#D4A843", fr: "#6BAF6B", eberron: "#5B8DBF" };

export const GARDEN_TYPES = ["Decorative","Food","Herb","Poison"];
export const PUB_BEVERAGES = [
  "Bigby's Burden (Enlarge 24h)",
  "Kiss of the Spider Queen (Spider Climb 24h)",
  "Moonlight Serenade (Darkvision 24h)",
  "Positive Reinforcement (Necrotic Resistance 24h)",
  "Sterner Stuff (Immune Frightened 24h)",
];
export const TRAINING_TYPES = ["Battle Expert","Skills Expert","Tools Expert","Unarmed Combat Expert","Weapon Expert"];
export const GUILD_TYPES = ["Adventurers' Guild","Bakers' Guild","Brewers' Guild","Masons' Guild","Shipbuilders' Guild","Thieves' Guild"];
export const MANIFEST_PLANES = ["Daanvi","Dolurrh","Fernia","Irian","Lamannia","Mabar","Risia","Shavarath","Syrania","Thelanis","Xoriat"];
export const MUSEUM_CHARMS = ["Argonnessen","Ashtakala","Dhakaan","Khyber","Xen'drik"];
export const ARCHIVE_BOOKS = [
  "Bigby's Handy Arcana Codex (Arcana)",
  "The Chronepsis Chronicles (History)",
  "Investigations of the Inquisitive (Investigation)",
  "Material Musings (Nature)",
  "The Old Faith and Other Religions (Religion)",
];
export const WORKSHOP_TOOLS_OPTIONS = [
  "Carpenter's Tools","Cobbler's Tools","Glassblower's Tools","Jeweler's Tools",
  "Leatherworker's Tools","Mason's Tools","Painter's Tools","Potter's Tools",
  "Tinker's Tools","Weaver's Tools","Woodcarver's Tools",
];

export function getMaxSpecialFacilities(level) {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 2;
  return 0;
}

export const SPECIAL_FACILITIES = [
  // ── CORE LEVEL 5 ──
  { key:"arcane_study",name:"Arcane Study",level:5,set:"core",prereq:"Arcane Focus or tool as Spellcasting Focus",space:"roomy",hirelings:1,order:"Craft",
    desc:"Quiet research space with desks and bookshelves.",benefits:["⭐ Passive: Charm of Identify (after Long Rest, 7 days)","Order: Craft Arcane Focus (7d, free)","Order: Craft Book (7d, 10 GP)","Order: Craft Magic Item — Arcana (lvl 9+, 20d)"],multi:false,enlarge:false},
  { key:"armory",name:"Armory",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Trade",
    desc:"Racks for weapons, armor stands, and ammunition storage.",benefits:["Order: Stock Armory (100 GP + 100/defender)","Stocked: roll d8 instead of d6 for attacks","Smithy halves stocking cost"],multi:false,enlarge:false},
  { key:"barrack",name:"Barrack",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Recruit",
    desc:"Sleeping quarters for up to 12 Bastion Defenders.",benefits:["Order: Recruit up to 4 defenders (free)","Houses up to 12 defenders (25 if Vast)","Vast: 2,000 GP to enlarge"],multi:true,enlarge:true},
  { key:"garden",name:"Garden",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Harvest",
    desc:"A cultivated space. Choose type: Decorative, Food, Herb, or Poison.",benefits:["Order: Harvest Decorative — 10 bouquets/perfume/candles (5 GP ea)","Order: Harvest Food — 100 days rations","Order: Harvest Herb — 10 Healer's Kits OR 1 Potion of Healing","Order: Harvest Poison — 2 Antitoxin OR 1 Basic Poison","Vast: two garden types (2,000 GP)"],multi:true,enlarge:true,hasOptions:"garden_type"},
  { key:"library",name:"Library",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Book collection with desks and reading chairs.",benefits:["Order: Research Topical Lore — 3 accurate pieces on any topic (7d)"],multi:false,enlarge:false},
  { key:"sanctuary",name:"Sanctuary",level:5,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"roomy",hirelings:1,order:"Craft",
    desc:"Worship space with religious icons.",benefits:["⭐ Passive: Charm of Healing Word (after Long Rest, 7 days)","Order: Craft Druidic Focus or Holy Symbol (7d, free)"],multi:false,enlarge:false},
  { key:"smithy",name:"Smithy",level:5,set:"core",prereq:null,space:"roomy",hirelings:2,order:"Craft",
    desc:"Forge, anvil, and metalworking tools.",benefits:["Order: Craft with Smith's Tools","Order: Craft Magic Item — Armament (lvl 9+, 20d)","Halves Armory stocking cost"],multi:false,enlarge:false},
  { key:"storehouse",name:"Storehouse",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Trade",
    desc:"Cool, dark space for trade goods.",benefits:["Order: Procure items ≤500 GP (≤2k at 9, ≤5k at 13)","Order: Sell at +10% profit (+20% at 9, +50% at 13, +100% at 17)"],multi:false,enlarge:false},
  { key:"workshop",name:"Workshop",level:5,set:"core",prereq:null,space:"roomy",hirelings:3,order:"Craft",
    desc:"Creative space with 6 chosen Artisan's Tools.",benefits:["Order: Craft Adventuring Gear","Order: Craft Magic Item — Implement (lvl 9+, 20d)","⭐ Passive: Short Rest here → Heroic Inspiration","Vast: +2 hirelings, +3 tools (2,000 GP)"],multi:false,enlarge:true,hasOptions:"workshop_tools"},
  // ── CORE LEVEL 9 ──
  { key:"gaming_hall",name:"Gaming Hall",level:9,set:"core",prereq:null,space:"vast",hirelings:4,order:"Trade",
    desc:"Recreational games: chess, darts, cards, dice.",benefits:["Order: Run Gambling Hall (7d) — 1d100 for winnings"],multi:false,enlarge:false},
  { key:"greenhouse",name:"Greenhouse",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Harvest",
    desc:"Climate-controlled enclosure for rare plants.",benefits:["⭐ Passive: 3 magical fruits/day (Lesser Restoration, 24h)","Order: Harvest Healing Herbs — Potion of Healing (Greater)","Order: Harvest Poison — Assassin's Blood, Malice, Pale Tincture, or Truth Serum"],multi:false,enlarge:false},
  { key:"laboratory",name:"Laboratory",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Craft",
    desc:"Alchemical supplies and workspaces.",benefits:["Order: Craft with Alchemist's Supplies","Order: Craft Poison — Burnt Othur Fumes, Essence of Ether, or Torpor (7d, half cost)"],multi:false,enlarge:false},
  { key:"sacristy",name:"Sacristy",level:9,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"roomy",hirelings:1,order:"Craft",
    desc:"Preparation and storage for sacred items.",benefits:["Order: Craft Holy Water (7d, free; +1d8/100 GP up to 500 GP)","Order: Craft Magic Item — Relic (Common/Uncommon, 20d)","⭐ Passive: Short Rest here → regain 1 spell slot ≤ 5th"],multi:false,enlarge:false},
  { key:"scriptorium",name:"Scriptorium",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Craft",
    desc:"Desks and writing supplies for copying and scribing.",benefits:["Order: Craft Book Replica (7d, needs blank book)","Order: Craft Spell Scroll (Cleric/Wizard ≤ 3rd, 5d)","Order: Craft Paperwork — up to 50 copies (7d, 1 GP/copy)"],multi:false,enlarge:false},
  { key:"stable",name:"Stable",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Trade",
    desc:"Houses 3 Large animals. Comes with 1 horse + 2 ponies/mules.",benefits:["⭐ Passive: 14 days here → Advantage on Animal Handling","Order: Buy/sell mounts","Sell at +20% (+50% at 13, +100% at 17)","Vast: houses 6 Large (2,000 GP)"],multi:true,enlarge:true},
  { key:"teleportation_circle",name:"Teleportation Circle",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Recruit",
    desc:"Permanent teleportation circle on the floor.",benefits:["⭐ Passive: Permanent Teleportation Circle destination","Order: Recruit Spellcaster (even roll = success)","Casts 1 Wizard spell ≤ 4th (≤ 8th at 17), stays 14 days"],multi:false,enlarge:false},
  { key:"theater",name:"Theater",level:9,set:"core",prereq:null,space:"vast",hirelings:4,order:"Empower",
    desc:"Stage, backstage, and audience seating.",benefits:["Order: Stage Production (14d rehearsal + 7d+ performances)","DC 15 Performance check → Theater die (d6/d8/d10)","Add die to any d20 test"],multi:false,enlarge:false},
  { key:"training_area",name:"Training Area",level:9,set:"core",prereq:null,space:"vast",hirelings:4,order:"Empower",
    desc:"Open courtyard, gymnasium, or obstacle course.",benefits:["Choose trainer: Battle/Skills/Tools/Unarmed/Weapon Expert","Order: Train 8h/day for 7 days → benefit for 7 days","Can swap trainer each Bastion turn"],multi:true,enlarge:false,hasOptions:"training_type"},
  { key:"trophy_room",name:"Trophy Room",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Mementos from battles, dungeons, and ancestors.",benefits:["Order: Research Lore — 3 pieces on any topic (7d)","Order: Research Trinket — even roll = Common Implement magic item"],multi:false,enlarge:false},
  // ── CORE LEVEL 13 ──
  { key:"archive",name:"Archive",level:13,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Repository of valuable books, maps, and scrolls.",benefits:["Order: Research Helpful Lore — Legend Lore effect (7d)","⭐ Passive: 1 Reference Book (Advantage on a Study check type)","Vast: 2 additional books (2,000 GP)"],multi:false,enlarge:true,hasOptions:"archive_books"},
  { key:"meditation_chamber",name:"Meditation Chamber",level:13,set:"core",prereq:null,space:"cramped",hirelings:1,order:"Empower",
    desc:"Relaxing space for mind-body-spirit alignment.",benefits:["Order: Empower Inner Peace — roll twice on Bastion Events, choose one","⭐ Passive: Meditate 7 days → Advantage on 2 random saving throws for 7 days"],multi:false,enlarge:false},
  { key:"menagerie",name:"Menagerie",level:13,set:"core",prereq:null,space:"vast",hirelings:2,order:"Recruit",
    desc:"Enclosures for up to 4 Large creatures.",benefits:["Order: Recruit Creature (50–3,500 GP, 7d)","Creatures count as Bastion Defenders","Options: Ape, Black Bear, Brown Bear, Constrictor Snake, Crocodile, Dire Wolf, Giant Vulture, Hyena, Jackal, Lion, Owlbear, Panther, Tiger"],multi:false,enlarge:false},
  { key:"observatory",name:"Observatory",level:13,set:"core",prereq:"Ability to use a Spellcasting Focus",space:"roomy",hirelings:1,order:"Empower",
    desc:"Telescope aimed at the night sky.",benefits:["⭐ Passive: Charm of Contact Other Plane (after Long Rest, 7 days)","Order: Eldritch Discovery — 7 nights, odd roll = Charm of Darkvision/Heroism/Vitality"],multi:false,enlarge:false},
  { key:"pub",name:"Pub",level:13,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Tavern with a spy network in nearby communities.",benefits:["Order: Research Info — events within 10 miles, locate creature within 50 miles (7d)","⭐ Passive: Pub Special — 1 magical beverage on tap","Vast: 2 beverages, +3 hirelings (2,000 GP)"],multi:false,enlarge:true,hasOptions:"pub_beverage"},
  { key:"reliquary",name:"Reliquary",level:13,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"cramped",hirelings:1,order:"Harvest",
    desc:"Vault of sacred objects.",benefits:["⭐ Passive: Charm of Greater Restoration (after Long Rest, 7 days)","Order: Harvest Talisman — replaces ≤1,000 GP material components"],multi:false,enlarge:false},
  // ── CORE LEVEL 17 ──
  { key:"demiplane",name:"Demiplane",level:17,set:"core",prereq:"Arcane Focus or tool as Spellcasting Focus",space:"vast",hirelings:1,order:"Empower",
    desc:"Extradimensional stone room accessed by a door in your Bastion.",benefits:["Order: Empower Arcane Resilience — Temp HP = 5 × level (Long Rest in Demiplane, 7 days)","⭐ Passive: Fabrication — Create nonmagical object ≤5ft, ≤5 GP (1/Long Rest)"],multi:false,enlarge:false},
  { key:"guildhall",name:"Guildhall",level:17,set:"core",prereq:"Expertise in a skill",space:"vast",hirelings:1,order:"Recruit",
    desc:"Meeting room for your ~50-member guild.",benefits:["Choose guild: Adventurers', Bakers', Brewers', Masons', Shipbuilders', or Thieves'","Order: Recruit Guild Assignment (unique per guild type, 7d)"],multi:false,enlarge:false,hasOptions:"guild_type"},
  { key:"sanctum",name:"Sanctum",level:17,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"roomy",hirelings:4,order:"Empower",
    desc:"A place of solace and healing.",benefits:["⭐ Passive: Charm of Heal (after Long Rest, 7 days)","Order: Empower Fortifying Rites — target gains Temp HP = your level after Long Rests (7 days)","⭐ Passive: Word of Recall can target your Sanctum + Heal on arrival"],multi:false,enlarge:false},
  { key:"war_room",name:"War Room",level:17,set:"core",prereq:"Fighting Style or Unarmored Defense feature",space:"vast",hirelings:2,order:"Recruit",
    desc:"Military planning room with loyal lieutenants (Veteran Warriors).",benefits:["Start with 2 lieutenants (up to 10)","Each lieutenant reduces attack dice by 1","Order: Recruit Lieutenant (7d)","Order: Recruit Soldiers — 100 Guards per lieutenant (1 GP/day each)"],multi:false,enlarge:false},
  // ── FORGOTTEN REALMS ──
  { key:"amethyst_dragon_den",name:"Amethyst Dragon Den",level:5,set:"fr",prereq:"Membership in the Purple Dragon Knights",space:"vast",hirelings:1,order:"Empower",
    desc:"Enclosed chamber with a pool for amethyst dragons.",benefits:["Order: Empower Psionic Defenses — Resistance to Psychic damage (7 days, 8h/day training)"],multi:false,enlarge:false},
  { key:"harper_hideout",name:"Harper Hideout",level:5,set:"fr",prereq:"Membership in the Harpers",space:"roomy",hirelings:1,order:"Empower",
    desc:"Hidden safe house connected by tunnel (up to ¼ mile).",benefits:["⭐ Passive: Always protected by Alarm","⭐ Passive: Lvl 9: magic door, ≤100 miles; Lvl 13: Faerûn; Lvl 17: any plane","Order: Empower Harper Training — Deception, Investigation, or Performance (7 days)"],multi:false,enlarge:false},
  { key:"red_wizard_necropolis",name:"Red Wizard Necropolis",level:5,set:"fr",prereq:"Membership in Red Wizards + Spellcasting Focus",space:"roomy",hirelings:1,order:"Recruit",
    desc:"Crypts and burial chambers for Undead defenders.",benefits:["Order: Recruit up to 4 Undead Defenders per turn","Houses up to 8 Undead Defenders","⭐ Passive: Destroyed Undead return after 14 days"],multi:false,enlarge:false},
  { key:"zhentarim_travel_station",name:"Zhentarim Travel Station",level:5,set:"fr",prereq:"Membership in the Zhentarim",space:"vast",hirelings:2,order:"Research",
    desc:"Way-station for safe long-distance travel with stabling.",benefits:["⭐ Passive: Long Rest here → travel pace +1 step","Order: Research Reconnaissance — Advantage on Survival for journey (7d)"],multi:false,enlarge:false},
  { key:"emerald_enclave_grove",name:"Emerald Enclave Grove",level:9,set:"fr",prereq:"Membership in the Emerald Enclave",space:"vast",hirelings:2,order:"Recruit",
    desc:"Natural haven with trees, grass, and flowing water.",benefits:["Order: Recruit Nature creature (even roll = success)","Options: Treant, Unicorn, Dryad, Blink Dog, etc.","Creatures count as Bastion Defenders"],multi:false,enlarge:false},
  { key:"lords_alliance_noble_residence",name:"Lords' Alliance Noble Residence",level:9,set:"fr",prereq:"Membership in the Lords' Alliance",space:"vast",hirelings:1,order:"Recruit",
    desc:"Luxurious apartment fit for a city ruler.",benefits:["⭐ Passive: Long Rest here → Heroic Inspiration","Order: Recruit Visiting Noble — intelligence on creature within 50 miles of their city"],multi:false,enlarge:false},
  { key:"order_gauntlet_tournament",name:"Order of the Gauntlet Tournament Field",level:9,set:"fr",prereq:"Membership in the Order of the Gauntlet",space:"vast",hirelings:1,order:"Empower",
    desc:"Combat field for armed duels with spectator seating.",benefits:["⭐ Passive: Knight hireling reduces attack dice by 1","Order: Empower Hold Tournament (14d prep, 2,000 GP) → +1 Renown"],multi:false,enlarge:false},
  { key:"cult_dragon_archive",name:"Cult of the Dragon Archive",level:13,set:"fr",prereq:"Membership in the Cult of the Dragon",space:"roomy",hirelings:1,order:"Research",
    desc:"Extensive records on dragons and draconic lore.",benefits:["Order: Research Helpful Lore — Legend Lore effect (7d)","⭐ Passive: Advantage on Nature/Religion checks about Dragons/Tiamat/Cult","Vast: +2 reference books from Archive list (2,000 GP)"],multi:false,enlarge:true},
  // ── EBERRON ──
  { key:"dragonmark_outpost",name:"Dragonmark Outpost",level:5,set:"eberron",prereq:"Renown 10+ with any dragonmarked house",space:"roomy",hirelings:1,order:"Empower",
    desc:"Area set aside for your dragonmarked house.",benefits:["⭐ Passive: +1 Renown with house on construction","⭐ Passive: Extra 2nd-level Dragonmark spell slot (after Long Rest)","Order: Empower House Favor (use Renown benefit, doesn't count against limit)"],multi:false,enlarge:false},
  { key:"kundarak_vault",name:"Kundarak Vault",level:9,set:"eberron",prereq:"Renown 15+ with House Kundarak",space:"cramped",hirelings:1,order:"Trade",
    desc:"Extradimensional secure vault accessible from any Kundarak bank.",benefits:["⭐ Passive: Access vault from any Kundarak bank worldwide","Order: Trade Goods — Buy items ≤2,000 GP (≤5,000 at 13)","Sell at +20% (+50% at 13, +100% at 17)"],multi:false,enlarge:false},
  { key:"navigators_helm",name:"Navigator's Helm",level:9,set:"eberron",prereq:null,space:"cramped",hirelings:1,order:"Empower",
    desc:"Allows a mobile Bastion in a waterborne vehicle to travel.",benefits:["Order: Empower Travel — pilot at vehicle speed, 8h/day","DM rolls on Bastion Events table when traveling"],multi:false,enlarge:false},
  { key:"orien_helm",name:"Orien Helm",level:9,set:"eberron",prereq:"Renown 15+ with House Orien",space:"cramped",hirelings:1,order:"Empower",
    desc:"Allows a mobile Bastion in a Lightning Rail cart to travel.",benefits:["Order: Empower Travel — 30 mph along conductor stones, 8h/day","DM rolls on Bastion Events table when traveling"],multi:false,enlarge:false},
  { key:"artificers_forge",name:"Artificer's Forge",level:13,set:"eberron",prereq:"Artisan's Tools as Spellcasting Focus",space:"roomy",hirelings:2,order:"Craft",
    desc:"Magewright workshop for creating magic items.",benefits:["⭐ Passive: Crafting Assistants reduce crafting time","Order: Craft Any Common or Uncommon magic item","⭐ Passive: Charge Refreshment — magic items regain +1 extra charge"],multi:false,enlarge:false},
  { key:"inquisitives_agency",name:"Inquisitive's Agency",level:13,set:"eberron",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Office for an inquisitive agency with contacts network.",benefits:["Order: Research — Full surveillance on a person for 7 days within 10 miles","Learn: location, spending, meetings, ID checks","Network needs 7 days to establish after moving"],multi:false,enlarge:false},
  { key:"lyrandar_helm",name:"Lyrandar Helm",level:13,set:"eberron",prereq:"Renown 25+ with House Lyrandar",space:"cramped",hirelings:1,order:"Empower",
    desc:"Allows a mobile Bastion in an elemental airship/galleon to travel.",benefits:["Order: Empower Travel — pilot at vehicle speed, 8h/day","DM rolls on Bastion Events table when traveling"],multi:false,enlarge:false},
  { key:"manifest_zone",name:"Manifest Zone",level:13,set:"eberron",prereq:"Ability to use a Spellcasting Focus",space:"vast",hirelings:1,order:"Empower",
    desc:"Bastion infused with planar energy from one of Eberron's planes.",benefits:["Choose plane: Daanvi, Dolurrh, Fernia, Irian, Lamannia, Mabar, Risia, Shavarath, Syrania, Thelanis, Xoriat","Order: Empower Manifest Charm (7d rites) — unique per plane","Connection suspends during travel; re-establish in 7 days"],multi:false,enlarge:false,hasOptions:"manifest_plane"},
  { key:"museum",name:"Museum",level:13,set:"eberron",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Relics and treasures from expeditions, carefully cataloged.",benefits:["Order: Research Specialized Lore — Legend Lore on ancient history (7d)","⭐ Passive: Secrets of the Past — Study 7 days → Charm based on origin","Vast: 2 treasures, +2 hirelings (2,000 GP)"],multi:false,enlarge:true,hasOptions:"museum_charm"},
  { key:"construct_forge",name:"Construct Forge",level:17,set:"eberron",prereq:"Artisan's Tools as Spellcasting Focus",space:"vast",hirelings:2,order:"Recruit",
    desc:"Workshop for building Constructs.",benefits:["Order: Recruit Animated Armor (14d, 1,000 GP)","Order: Recruit Helmed Horror (42d, 5,000 GP)","Order: Recruit Shield Guardian (63d, 25,000 GP)","Constructs count as Bastion Defenders"],multi:false,enlarge:false},
];

// ─── ORDER OPTIONS PER FACILITY ─────────────────────────────────
// Each entry is an array of { name, duration (days), cost_gp }

export const ORDER_OPTIONS = {
  // Core Level 5
  arcane_study: [
    { name: "Craft: Arcane Focus", duration: 7, cost: 0 },
    { name: "Craft: Book", duration: 7, cost: 10 },
    { name: "Craft: Magic Item (Arcana)", duration: 20, cost: 250, minLevel: 9 },
  ],
  armory: [
    { name: "Trade: Stock Armory", duration: 7, cost: 100, note: "+100 GP per defender; halved with Smithy" },
  ],
  barrack: [
    { name: "Recruit: Bastion Defenders (4)", duration: 7, cost: 0 },
  ],
  garden: [
    { name: "Harvest: Decorative — bouquets/perfume/candles", duration: 7, cost: 0 },
    { name: "Harvest: Food — 100 days rations", duration: 7, cost: 0 },
    { name: "Harvest: Herb — 10 Healer's Kits", duration: 7, cost: 0 },
    { name: "Harvest: Herb — 1 Potion of Healing", duration: 7, cost: 0 },
    { name: "Harvest: Poison — 2 Antitoxin", duration: 7, cost: 0 },
    { name: "Harvest: Poison — 1 Basic Poison", duration: 7, cost: 0 },
  ],
  library: [
    { name: "Research: Topical Lore (3 pieces)", duration: 7, cost: 0 },
  ],
  sanctuary: [
    { name: "Craft: Druidic Focus (wooden staff)", duration: 7, cost: 0 },
    { name: "Craft: Holy Symbol", duration: 7, cost: 0 },
  ],
  smithy: [
    { name: "Craft: Smith's Tools Item", duration: 14, cost: 50 },
    { name: "Craft: Magic Item (Armament)", duration: 20, cost: 250, minLevel: 9 },
  ],
  storehouse: [
    { name: "Trade: Procure Goods (≤500 GP)", duration: 7, cost: 500 },
    { name: "Trade: Procure Goods (≤2,000 GP)", duration: 7, cost: 2000, minLevel: 9 },
    { name: "Trade: Procure Goods (≤5,000 GP)", duration: 7, cost: 5000, minLevel: 13 },
    { name: "Trade: Sell Goods", duration: 7, cost: 0 },
  ],
  workshop: [
    { name: "Craft: Adventuring Gear", duration: 10, cost: 25 },
    { name: "Craft: Magic Item (Implement)", duration: 20, cost: 250, minLevel: 9 },
  ],
  // Core Level 9
  gaming_hall: [
    { name: "Trade: Run Gambling Hall", duration: 7, cost: 0 },
  ],
  greenhouse: [
    { name: "Harvest: Healing Herbs — Potion of Healing (Greater)", duration: 7, cost: 0 },
    { name: "Harvest: Poison — Assassin's Blood", duration: 7, cost: 0 },
    { name: "Harvest: Poison — Malice", duration: 7, cost: 0 },
    { name: "Harvest: Poison — Pale Tincture", duration: 7, cost: 0 },
    { name: "Harvest: Poison — Truth Serum", duration: 7, cost: 0 },
  ],
  laboratory: [
    { name: "Craft: Alchemist's Supplies Item", duration: 7, cost: 25 },
    { name: "Craft: Poison — Burnt Othur Fumes", duration: 7, cost: 50 },
    { name: "Craft: Poison — Essence of Ether", duration: 7, cost: 50 },
    { name: "Craft: Poison — Torpor", duration: 7, cost: 50 },
  ],
  sacristy: [
    { name: "Craft: Holy Water (free)", duration: 7, cost: 0 },
    { name: "Craft: Holy Water (+1d8, 100 GP)", duration: 7, cost: 100 },
    { name: "Craft: Holy Water (+2d8, 200 GP)", duration: 7, cost: 200 },
    { name: "Craft: Holy Water (+3d8, 300 GP)", duration: 7, cost: 300 },
    { name: "Craft: Holy Water (+4d8, 400 GP)", duration: 7, cost: 400 },
    { name: "Craft: Holy Water (+5d8, 500 GP)", duration: 7, cost: 500 },
    { name: "Craft: Magic Item (Relic)", duration: 20, cost: 250 },
  ],
  scriptorium: [
    { name: "Craft: Book Replica", duration: 7, cost: 10 },
    { name: "Craft: Spell Scroll (Cleric/Wizard ≤3rd)", duration: 5, cost: 100 },
    { name: "Craft: Paperwork (up to 50 copies)", duration: 7, cost: 50 },
  ],
  stable: [
    { name: "Trade: Buy Mounts", duration: 7, cost: 0 },
    { name: "Trade: Sell Mounts (+20% profit)", duration: 7, cost: 0 },
  ],
  teleportation_circle: [
    { name: "Recruit: Invite Spellcaster (even roll = success)", duration: 7, cost: 0 },
  ],
  theater: [
    { name: "Empower: Stage Production (14d rehearsal + 7d show)", duration: 21, cost: 100 },
  ],
  training_area: [
    { name: "Empower: Train — Battle Expert", duration: 7, cost: 0 },
    { name: "Empower: Train — Skills Expert", duration: 7, cost: 0 },
    { name: "Empower: Train — Tools Expert", duration: 7, cost: 0 },
    { name: "Empower: Train — Unarmed Combat Expert", duration: 7, cost: 0 },
    { name: "Empower: Train — Weapon Expert", duration: 7, cost: 0 },
  ],
  trophy_room: [
    { name: "Research: Lore (3 pieces on any topic)", duration: 7, cost: 0 },
    { name: "Research: Trinket Trophy (even roll = Common magic item)", duration: 7, cost: 0 },
  ],
  // Core Level 13
  archive: [
    { name: "Research: Helpful Lore (Legend Lore effect)", duration: 7, cost: 0 },
  ],
  meditation_chamber: [
    { name: "Empower: Inner Peace (double-roll Bastion Events)", duration: 7, cost: 0 },
  ],
  menagerie: [
    { name: "Recruit: Ape (Medium, 500 GP)", duration: 7, cost: 500 },
    { name: "Recruit: Black Bear (Medium, 500 GP)", duration: 7, cost: 500 },
    { name: "Recruit: Brown Bear (Large, 1,000 GP)", duration: 7, cost: 1000 },
    { name: "Recruit: Constrictor Snake (Large, 250 GP)", duration: 7, cost: 250 },
    { name: "Recruit: Crocodile (Large, 500 GP)", duration: 7, cost: 500 },
    { name: "Recruit: Dire Wolf (Large, 1,000 GP)", duration: 7, cost: 1000 },
    { name: "Recruit: Giant Vulture (Large, 1,000 GP)", duration: 7, cost: 1000 },
    { name: "Recruit: Hyena (Medium, 50 GP)", duration: 7, cost: 50 },
    { name: "Recruit: Jackal (Small, 50 GP)", duration: 7, cost: 50 },
    { name: "Recruit: Lion (Large, 1,000 GP)", duration: 7, cost: 1000 },
    { name: "Recruit: Owlbear (Large, 3,500 GP)", duration: 7, cost: 3500 },
    { name: "Recruit: Panther (Medium, 250 GP)", duration: 7, cost: 250 },
    { name: "Recruit: Tiger (Large, 1,000 GP)", duration: 7, cost: 1000 },
  ],
  observatory: [
    { name: "Empower: Eldritch Discovery (7 nights, odd = Charm)", duration: 7, cost: 0 },
  ],
  pub: [
    { name: "Research: Information Gathering (10 mi, 7 days)", duration: 7, cost: 0 },
  ],
  reliquary: [
    { name: "Harvest: Talisman (replaces ≤1,000 GP components)", duration: 7, cost: 0 },
  ],
  // Core Level 17
  demiplane: [
    { name: "Empower: Arcane Resilience (Temp HP = 5×level, 7 days)", duration: 7, cost: 0 },
  ],
  guildhall: [
    { name: "Recruit: Adventurers' Guild Assignment", duration: 7, cost: 100 },
    { name: "Recruit: Bakers' Guild Assignment (500 GP or favor)", duration: 7, cost: 0 },
    { name: "Recruit: Brewers' Guild (50 barrels of ale)", duration: 7, cost: 0 },
    { name: "Recruit: Masons' Guild (free defensive wall)", duration: 7, cost: 0 },
    { name: "Recruit: Shipbuilders' Guild Assignment", duration: 7, cost: 0 },
    { name: "Recruit: Thieves' Guild (steal an object)", duration: 7, cost: 250 },
  ],
  sanctum: [
    { name: "Empower: Fortifying Rites (Temp HP = level, 7 days)", duration: 7, cost: 0 },
  ],
  war_room: [
    { name: "Recruit: Lieutenant", duration: 7, cost: 0 },
    { name: "Recruit: Soldiers (100 Guards, 1 GP/day each)", duration: 7, cost: 100 },
  ],
  // Forgotten Realms
  amethyst_dragon_den: [{ name: "Empower: Psionic Defenses (Psychic Resistance, 7d)", duration: 7, cost: 0 }],
  harper_hideout: [{ name: "Empower: Harper Training (Deception/Investigation/Performance)", duration: 7, cost: 0 }],
  red_wizard_necropolis: [{ name: "Recruit: Undead Defenders (4)", duration: 7, cost: 0 }],
  zhentarim_travel_station: [{ name: "Research: Reconnaissance (Adv. Survival)", duration: 7, cost: 0 }],
  emerald_enclave_grove: [{ name: "Recruit: Creature of Nature (even roll = success)", duration: 7, cost: 0 }],
  lords_alliance_noble_residence: [{ name: "Recruit: Visiting Noble (14 days)", duration: 14, cost: 0 }],
  order_gauntlet_tournament: [{ name: "Empower: Hold Tournament (+1 Renown)", duration: 14, cost: 2000 }],
  cult_dragon_archive: [{ name: "Research: Helpful Lore (Legend Lore)", duration: 7, cost: 0 }],
  // Eberron
  dragonmark_outpost: [{ name: "Empower: House Favor", duration: 7, cost: 0 }],
  kundarak_vault: [
    { name: "Trade: Procure Goods (≤2,000 GP)", duration: 7, cost: 2000 },
    { name: "Trade: Procure Goods (≤5,000 GP)", duration: 7, cost: 5000, minLevel: 13 },
    { name: "Trade: Sell Goods", duration: 7, cost: 0 },
  ],
  navigators_helm: [{ name: "Empower: Travel", duration: 7, cost: 0 }],
  orien_helm: [{ name: "Empower: Travel", duration: 7, cost: 0 }],
  artificers_forge: [{ name: "Craft: Magic Item (Common or Uncommon)", duration: 20, cost: 250 }],
  inquisitives_agency: [{ name: "Research: Surveillance on a Person (7 days)", duration: 7, cost: 0 }],
  lyrandar_helm: [{ name: "Empower: Travel", duration: 7, cost: 0 }],
  manifest_zone: [{ name: "Empower: Manifest Charm (7d rites)", duration: 7, cost: 0 }],
  museum: [{ name: "Research: Specialized Lore (Legend Lore)", duration: 7, cost: 0 }],
  construct_forge: [
    { name: "Recruit: Animated Armor", duration: 14, cost: 1000 },
    { name: "Recruit: Animated Broom", duration: 7, cost: 250 },
    { name: "Recruit: Animated Flying Sword", duration: 7, cost: 250 },
    { name: "Recruit: Animated Rug of Smothering", duration: 21, cost: 2000 },
    { name: "Recruit: Helmed Horror", duration: 42, cost: 5000 },
    { name: "Recruit: Scarecrow", duration: 14, cost: 1000 },
    { name: "Recruit: Shield Guardian", duration: 63, cost: 25000 },
  ],
};

// ─── ENLARGEMENT COSTS ──────────────────────────────────────────

export const ENLARGE_COST = { cost_gp: 2000, time_days: 80 }; // Roomy → Vast for all enlargeable facilities

// ─── BARRACK CAPACITY ───────────────────────────────────────────

export function getBarrackCapacity(size) {
  return size === "vast" ? 25 : 12;
}
