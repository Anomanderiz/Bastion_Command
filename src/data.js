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
    desc:"Quiet research space with desks and bookshelves.",benefits:["Charm: Identify (free, after Long Rest, 7 days)","Craft: Arcane Focus (7d, free)","Craft: Book (7d, 10 GP)","Craft: Magic Item — Arcana (lvl 9+)"],multi:false,enlarge:false},
  { key:"armory",name:"Armory",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Trade",
    desc:"Racks for weapons, armor stands, and ammunition storage.",benefits:["Trade: Stock Armory (100 GP + 100/defender)","Stocked: roll d8 instead of d6 for attacks","Smithy halves stocking cost"],multi:false,enlarge:false},
  { key:"barrack",name:"Barrack",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Recruit",
    desc:"Sleeping quarters for up to 12 Bastion Defenders.",benefits:["Recruit: Up to 4 defenders per turn (free)","Houses up to 12 defenders","Vast: up to 25 defenders (2,000 GP)"],multi:true,enlarge:true},
  { key:"garden",name:"Garden",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Harvest",
    desc:"A cultivated space. Choose type: Decorative, Food, Herb, or Poison.",benefits:["Decorative: 10 bouquets/perfume/candles (5 GP ea)","Food: 100 days rations","Herb: 10 Healer's Kits or 1 Potion of Healing","Poison: 2 Antitoxin or 1 Basic Poison","Vast: two garden types (2,000 GP)"],multi:true,enlarge:true,hasOptions:"garden_type"},
  { key:"library",name:"Library",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Book collection with desks and reading chairs.",benefits:["Research: 3 accurate lore pieces on any topic (7d)"],multi:false,enlarge:false},
  { key:"sanctuary",name:"Sanctuary",level:5,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"roomy",hirelings:1,order:"Craft",
    desc:"Worship space with religious icons.",benefits:["Charm: Healing Word (free, after Long Rest, 7 days)","Craft: Druidic Focus or Holy Symbol (7d, free)"],multi:false,enlarge:false},
  { key:"smithy",name:"Smithy",level:5,set:"core",prereq:null,space:"roomy",hirelings:2,order:"Craft",
    desc:"Forge, anvil, and metalworking tools.",benefits:["Craft: Smith's Tools items","Craft: Magic Item — Armament (lvl 9+)","Halves Armory stocking cost"],multi:false,enlarge:false},
  { key:"storehouse",name:"Storehouse",level:5,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Trade",
    desc:"Cool, dark space for trade goods.",benefits:["Trade: Buy items ≤500 GP (≤2k at 9, ≤5k at 13)","Sell at +10% profit (+20% at 9, +50% at 13, +100% at 17)"],multi:false,enlarge:false},
  { key:"workshop",name:"Workshop",level:5,set:"core",prereq:null,space:"roomy",hirelings:3,order:"Craft",
    desc:"Creative space with 6 chosen Artisan's Tools.",benefits:["Craft: Adventuring Gear","Craft: Magic Item — Implement (lvl 9+)","Short Rest here → Heroic Inspiration","Vast: +2 hirelings, +3 tools (2,000 GP)"],multi:false,enlarge:true,hasOptions:"workshop_tools"},
  // ── CORE LEVEL 9 ──
  { key:"gaming_hall",name:"Gaming Hall",level:9,set:"core",prereq:null,space:"vast",hirelings:4,order:"Trade",
    desc:"Recreational games: chess, darts, cards, dice.",benefits:["Trade: Gambling den for 7 days","Winnings: 1d100 → 1d6–10d6 × 10 GP"],multi:false,enlarge:false},
  { key:"greenhouse",name:"Greenhouse",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Harvest",
    desc:"Climate-controlled enclosure for rare plants.",benefits:["3 magical fruits/day (Lesser Restoration)","Harvest: Potion of Healing (Greater) (7d, free)","Harvest: Poison — Assassin's Blood, Malice, Pale Tincture, or Truth Serum"],multi:false,enlarge:false},
  { key:"laboratory",name:"Laboratory",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Craft",
    desc:"Alchemical supplies and workspaces.",benefits:["Craft: Alchemist's Supplies items","Craft: Poison — Burnt Othur Fumes, Essence of Ether, or Torpor (7d, half cost)"],multi:false,enlarge:false},
  { key:"sacristy",name:"Sacristy",level:9,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"roomy",hirelings:1,order:"Craft",
    desc:"Preparation and storage for sacred items.",benefits:["Craft: Holy Water (7d, free; +1d8/100 GP up to 500 GP)","Craft: Magic Item — Relic (Common/Uncommon)","Short Rest here → regain 1 spell slot ≤ 5th"],multi:false,enlarge:false},
  { key:"scriptorium",name:"Scriptorium",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Craft",
    desc:"Desks and writing supplies for copying and scribing.",benefits:["Craft: Book Replica (7d, needs blank book)","Craft: Spell Scroll (Cleric/Wizard ≤ 3rd level)","Craft: Paperwork — up to 50 copies (7d, 1 GP/copy)"],multi:false,enlarge:false},
  { key:"stable",name:"Stable",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Trade",
    desc:"Houses 3 Large animals. Comes with 1 horse + 2 ponies/mules.",benefits:["14 days here → Advantage on Animal Handling","Trade: Buy/sell mounts","Sell at +20% (+50% at 13, +100% at 17)","Vast: houses 6 Large (2,000 GP)"],multi:true,enlarge:true},
  { key:"teleportation_circle",name:"Teleportation Circle",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Recruit",
    desc:"Permanent teleportation circle on the floor.",benefits:["Permanent Teleportation Circle destination","Recruit: Invite spellcaster (even roll = success)","Spellcaster casts 1 Wizard spell ≤ 4th (≤ 8th at 17)","Stays 14 days or until they cast"],multi:false,enlarge:false},
  { key:"theater",name:"Theater",level:9,set:"core",prereq:null,space:"vast",hirelings:4,order:"Empower",
    desc:"Stage, backstage, and audience seating.",benefits:["Empower: Theatrical production","14d rehearsal + 7d+ performances","DC 15 Performance check → Theater die (d6/d8/d10)","Add to any d20 test"],multi:false,enlarge:false},
  { key:"training_area",name:"Training Area",level:9,set:"core",prereq:null,space:"vast",hirelings:4,order:"Empower",
    desc:"Open courtyard, gymnasium, or obstacle course.",benefits:["Choose trainer: Battle/Skills/Tools/Unarmed/Weapon Expert","Empower: Train 8h/day for 7 days → benefit for 7 days","Can swap trainer each Bastion turn"],multi:true,enlarge:false,hasOptions:"training_type"},
  { key:"trophy_room",name:"Trophy Room",level:9,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Mementos from battles, dungeons, and ancestors.",benefits:["Research: Lore — 3 pieces on any topic (7d)","Research: Trinket — even roll = Common Implement magic item"],multi:false,enlarge:false},
  // ── CORE LEVEL 13 ──
  { key:"archive",name:"Archive",level:13,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Repository of valuable books, maps, and scrolls.",benefits:["Research: Legend Lore effect (7d)","1 Reference Book (Advantage on a Study check type)","Vast: 2 additional books (2,000 GP)"],multi:false,enlarge:true,hasOptions:"archive_books"},
  { key:"meditation_chamber",name:"Meditation Chamber",level:13,set:"core",prereq:null,space:"cramped",hirelings:1,order:"Empower",
    desc:"Relaxing space for mind-body-spirit alignment.",benefits:["Empower: Roll twice on Bastion Events, choose one","Meditate 7 days → Advantage on 2 random saving throws for 7 days"],multi:false,enlarge:false},
  { key:"menagerie",name:"Menagerie",level:13,set:"core",prereq:null,space:"vast",hirelings:2,order:"Recruit",
    desc:"Enclosures for up to 4 Large creatures.",benefits:["Recruit: Add creature from list (50–3,500 GP)","Creatures count as Bastion Defenders","Owlbear: 3,500 GP; Lion/Tiger: 1,000 GP"],multi:false,enlarge:false},
  { key:"observatory",name:"Observatory",level:13,set:"core",prereq:"Ability to use a Spellcasting Focus",space:"roomy",hirelings:1,order:"Empower",
    desc:"Telescope aimed at the night sky.",benefits:["Charm: Contact Other Plane (after Long Rest, 7 days)","Empower: 7 nights → odd roll = Charm of Darkvision/Heroism/Vitality"],multi:false,enlarge:false},
  { key:"pub",name:"Pub",level:13,set:"core",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Tavern with a spy network in nearby communities.",benefits:["Research: Events within 10 miles for 7 days","Locate familiar creature within 50 miles","Pub Special: 1 magical beverage on tap","Vast: 2 beverages, +3 hirelings (2,000 GP)"],multi:false,enlarge:true,hasOptions:"pub_beverage"},
  { key:"reliquary",name:"Reliquary",level:13,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"cramped",hirelings:1,order:"Harvest",
    desc:"Vault of sacred objects.",benefits:["Charm: Greater Restoration (after Long Rest, 7 days)","Harvest: Talisman replaces ≤1,000 GP material components"],multi:false,enlarge:false},
  // ── CORE LEVEL 17 ──
  { key:"demiplane",name:"Demiplane",level:17,set:"core",prereq:"Arcane Focus or tool as Spellcasting Focus",space:"vast",hirelings:1,order:"Empower",
    desc:"Extradimensional stone room accessed by a door in your Bastion.",benefits:["Empower: Temp HP = 5 × level (Long Rest in Demiplane, 7 days)","Fabrication: Create nonmagical object ≤5ft, ≤5 GP (1/Long Rest)"],multi:false,enlarge:false},
  { key:"guildhall",name:"Guildhall",level:17,set:"core",prereq:"Expertise in a skill",space:"vast",hirelings:1,order:"Recruit",
    desc:"Meeting room for your ~50-member guild.",benefits:["Choose guild: Adventurers', Bakers', Brewers', Masons', Shipbuilders', or Thieves'","Recruit: Guild Assignment (unique per guild type)"],multi:false,enlarge:false,hasOptions:"guild_type"},
  { key:"sanctum",name:"Sanctum",level:17,set:"core",prereq:"Holy Symbol or Druidic Focus as Spellcasting Focus",space:"roomy",hirelings:4,order:"Empower",
    desc:"A place of solace and healing.",benefits:["Charm: Heal (after Long Rest, 7 days)","Empower: Target gains Temp HP = your level after Long Rests (7 days)","Word of Recall can target your Sanctum + Heal on arrival"],multi:false,enlarge:false},
  { key:"war_room",name:"War Room",level:17,set:"core",prereq:"Fighting Style or Unarmored Defense feature",space:"vast",hirelings:2,order:"Recruit",
    desc:"Military planning room with loyal lieutenants (Veteran Warriors).",benefits:["Start with 2 lieutenants (up to 10)","Each lieutenant reduces attack dice by 1","Recruit: Soldiers — 100 Guards per lieutenant (1 GP/day each)"],multi:false,enlarge:false},
  // ── FORGOTTEN REALMS ──
  { key:"amethyst_dragon_den",name:"Amethyst Dragon Den",level:5,set:"fr",prereq:"Membership in the Purple Dragon Knights",space:"vast",hirelings:1,order:"Empower",
    desc:"Enclosed chamber with a pool for amethyst dragons.",benefits:["Empower: Psionic Defenses — Resistance to Psychic damage (7 days, 8h/day training)"],multi:false,enlarge:false},
  { key:"harper_hideout",name:"Harper Hideout",level:5,set:"fr",prereq:"Membership in the Harpers",space:"roomy",hirelings:1,order:"Empower",
    desc:"Hidden safe house connected by tunnel (up to ¼ mile).",benefits:["Always protected by Alarm","Lvl 9: magic door, ≤100 miles; Lvl 13: anywhere in Faerûn; Lvl 17: any plane","Empower: Harper trainer — Deception, Investigation, or Performance (7 days)"],multi:false,enlarge:false},
  { key:"red_wizard_necropolis",name:"Red Wizard Necropolis",level:5,set:"fr",prereq:"Membership in Red Wizards + Spellcasting Focus",space:"roomy",hirelings:1,order:"Recruit",
    desc:"Crypts and burial chambers for Undead defenders.",benefits:["Recruit: Up to 4 Undead Defenders per turn","Houses up to 8 Undead Defenders","Destroyed Undead return after 14 days"],multi:false,enlarge:false},
  { key:"zhentarim_travel_station",name:"Zhentarim Travel Station",level:5,set:"fr",prereq:"Membership in the Zhentarim",space:"vast",hirelings:2,order:"Research",
    desc:"Way-station for safe long-distance travel with stabling.",benefits:["Long Rest here → travel pace +1 step","Research: Reconnaissance — Advantage on Survival for journey (7d)"],multi:false,enlarge:false},
  { key:"emerald_enclave_grove",name:"Emerald Enclave Grove",level:9,set:"fr",prereq:"Membership in the Emerald Enclave",space:"vast",hirelings:2,order:"Recruit",
    desc:"Natural haven with trees, grass, and flowing water.",benefits:["Recruit: Nature creature (even roll = success)","Options include Treant, Unicorn, Dryad, Blink Dog, etc.","Creatures count as Bastion Defenders"],multi:false,enlarge:false},
  { key:"lords_alliance_noble_residence",name:"Lords' Alliance Noble Residence",level:9,set:"fr",prereq:"Membership in the Lords' Alliance",space:"vast",hirelings:1,order:"Recruit",
    desc:"Luxurious apartment fit for a city ruler.",benefits:["Long Rest here → Heroic Inspiration","Recruit: Visiting Noble — intelligence on creature location within 50 miles of their city"],multi:false,enlarge:false},
  { key:"order_gauntlet_tournament",name:"Order of the Gauntlet Tournament Field",level:9,set:"fr",prereq:"Membership in the Order of the Gauntlet",space:"vast",hirelings:1,order:"Empower",
    desc:"Combat field for armed duels with spectator seating.",benefits:["Hireling Knight reduces attack dice by 1","Empower: Hold Tournament (14d prep, 2,000 GP) → +1 Renown"],multi:false,enlarge:false},
  { key:"cult_dragon_archive",name:"Cult of the Dragon Archive",level:13,set:"fr",prereq:"Membership in the Cult of the Dragon",space:"roomy",hirelings:1,order:"Research",
    desc:"Extensive records on dragons and draconic lore.",benefits:["Research: Legend Lore effect (7d)","Advantage on Nature/Religion checks about Dragons/Tiamat/Cult","Vast: +2 reference books from Archive list (2,000 GP)"],multi:false,enlarge:true},
  // ── EBERRON ──
  { key:"dragonmark_outpost",name:"Dragonmark Outpost",level:5,set:"eberron",prereq:"Renown 10+ with any dragonmarked house",space:"roomy",hirelings:1,order:"Empower",
    desc:"Area set aside for your dragonmarked house.",benefits:["+1 Renown with house on construction","Extra 2nd-level spell slot for Dragonmark spells (after Long Rest)","Empower: House Favor (use Renown benefit, doesn't count against limit)"],multi:false,enlarge:false},
  { key:"kundarak_vault",name:"Kundarak Vault",level:9,set:"eberron",prereq:"Renown 15+ with House Kundarak",space:"cramped",hirelings:1,order:"Trade",
    desc:"Extradimensional secure vault accessible from any Kundarak bank.",benefits:["Access vault contents from any Kundarak bank worldwide","Trade: Buy items ≤2,000 GP (≤5,000 at 13)","Sell at +20% (+50% at 13, +100% at 17)"],multi:false,enlarge:false},
  { key:"navigators_helm",name:"Navigator's Helm",level:9,set:"eberron",prereq:null,space:"cramped",hirelings:1,order:"Empower",
    desc:"Allows a mobile Bastion in a waterborne vehicle to travel.",benefits:["Empower: Travel — pilot at vehicle speed, 8h/day","DM rolls on Bastion Events table when traveling"],multi:false,enlarge:false},
  { key:"orien_helm",name:"Orien Helm",level:9,set:"eberron",prereq:"Renown 15+ with House Orien",space:"cramped",hirelings:1,order:"Empower",
    desc:"Allows a mobile Bastion in a Lightning Rail cart to travel.",benefits:["Empower: Travel — 30 mph along conductor stones, 8h/day","DM rolls on Bastion Events table when traveling"],multi:false,enlarge:false},
  { key:"artificers_forge",name:"Artificer's Forge",level:13,set:"eberron",prereq:"Artisan's Tools as Spellcasting Focus",space:"roomy",hirelings:2,order:"Craft",
    desc:"Magewright workshop for creating magic items.",benefits:["Crafting Assistants reduce crafting time","Craft: Any Common or Uncommon magic item","Hirelings have all spells prepared for spell-casting items","Charge Refreshment: magic items regain +1 extra charge"],multi:false,enlarge:false},
  { key:"inquisitives_agency",name:"Inquisitive's Agency",level:13,set:"eberron",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Office for an inquisitive agency with contacts network.",benefits:["Research: Full surveillance on a person for 7 days within 10 miles","Learn: location, spending, meetings, ID checks","Network needs 7 days to establish after moving"],multi:false,enlarge:false},
  { key:"lyrandar_helm",name:"Lyrandar Helm",level:13,set:"eberron",prereq:"Renown 25+ with House Lyrandar",space:"cramped",hirelings:1,order:"Empower",
    desc:"Allows a mobile Bastion in an elemental airship/galleon to travel.",benefits:["Empower: Travel — pilot at vehicle speed, 8h/day","DM rolls on Bastion Events table when traveling"],multi:false,enlarge:false},
  { key:"manifest_zone",name:"Manifest Zone",level:13,set:"eberron",prereq:"Ability to use a Spellcasting Focus",space:"vast",hirelings:1,order:"Empower",
    desc:"Bastion infused with planar energy from one of Eberron's planes.",benefits:["Choose plane: Daanvi, Dolurrh, Fernia, Irian, Lamannia, Mabar, Risia, Shavarath, Syrania, Thelanis, Xoriat","Empower: Manifest Charm (7d rites) — unique per plane","Connection suspends during travel; re-establish in 7 days"],multi:false,enlarge:false,hasOptions:"manifest_plane"},
  { key:"museum",name:"Museum",level:13,set:"eberron",prereq:null,space:"roomy",hirelings:1,order:"Research",
    desc:"Relics and treasures from expeditions, carefully cataloged.",benefits:["Research: Legend Lore on ancient history (7d)","Secrets of the Past: Study 7 days → Charm based on origin","Origins: Argonnessen, Ashtakala, Dhakaan, Khyber, Xen'drik","Vast: 2 treasures, +2 hirelings (2,000 GP)"],multi:false,enlarge:true,hasOptions:"museum_charm"},
  { key:"construct_forge",name:"Construct Forge",level:17,set:"eberron",prereq:"Artisan's Tools as Spellcasting Focus",space:"vast",hirelings:2,order:"Recruit",
    desc:"Workshop for building Constructs.",benefits:["Recruit: Animated Armor (14d, 1,000 GP)","Recruit: Helmed Horror (42d, 5,000 GP)","Recruit: Shield Guardian (63d, 25,000 GP)","Constructs count as Bastion Defenders"],multi:false,enlarge:false},
];
