// ─── CRAFTING REFERENCE DATA (generated — do not edit by hand) ─────────────
// Източник: DnD_Animal_Harvesting_Reference.xlsx + DnD_Experimental_Alchemy_System.xlsx + DnD_Raw_Materials_Economy.xlsx
// Регенерира се със scratchpad скрипта gen-crafting-data.js (виж crafting-feature-plan.md).
// Схема per таблица: { key, label, group, type: 'table'|'info',
//   nameCol (главната колона в списъка), badgeCol (втората колона/бадж или null),
//   filterable (има ли dropdown филтър по badgeCol), columns (пълният ред за
//   детайлния изглед), rows: [ { col: value } ] } — info таблиците имат entries: [{k, v}].

export const CRAFTING_TABLES = [
  {
    "key": "animals",
    "label": "Животни",
    "group": "Harvesting",
    "type": "table",
    "nameCol": "Animal",
    "badgeCol": "Size",
    "filterable": true,
    "columns": [
      "Animal",
      "Size",
      "Leather / Hide",
      "Hide Weight (lb)",
      "Hide Value (gp)",
      "Other Harvestable Resources",
      "Other Weight (lb)",
      "Other Value (gp)",
      "Harvest DC",
      "Notes"
    ],
    "rows": [
      {
        "Animal": "Rat",
        "Size": "Tiny",
        "Leather / Hide": "Pelt",
        "Hide Weight (lb)": 0.1,
        "Hide Value (gp)": 0.05,
        "Other Harvestable Resources": "Teeth; tail",
        "Other Weight (lb)": 0.05,
        "Other Value (gp)": 0.02,
        "Harvest DC": 5,
        "Notes": "Mostly worthless except in bulk/alchemy."
      },
      {
        "Animal": "Rabbit / Hare",
        "Size": "Tiny",
        "Leather / Hide": "Pelt",
        "Hide Weight (lb)": 0.3,
        "Hide Value (gp)": 0.2,
        "Other Harvestable Resources": "Meat; feet",
        "Other Weight (lb)": 2,
        "Other Value (gp)": 0.3,
        "Harvest DC": 5,
        "Notes": "Common small-game pelt."
      },
      {
        "Animal": "Fox",
        "Size": "Small",
        "Leather / Hide": "Fur",
        "Hide Weight (lb)": 1.5,
        "Hide Value (gp)": 2,
        "Other Harvestable Resources": "Teeth; claws; tail",
        "Other Weight (lb)": 0.3,
        "Other Value (gp)": 0.5,
        "Harvest DC": 8,
        "Notes": "Good decorative fur."
      },
      {
        "Animal": "Badger",
        "Size": "Small",
        "Leather / Hide": "Pelt",
        "Hide Weight (lb)": 2,
        "Hide Value (gp)": 1,
        "Other Harvestable Resources": "Claws; teeth; fat",
        "Other Weight (lb)": 1,
        "Other Value (gp)": 0.5,
        "Harvest DC": 8,
        "Notes": "Tough but coarse hide."
      },
      {
        "Animal": "Hyena",
        "Size": "Medium",
        "Leather / Hide": "Leather",
        "Hide Weight (lb)": 3,
        "Hide Value (gp)": 5,
        "Other Harvestable Resources": "Teeth; claws",
        "Other Weight (lb)": 0.75,
        "Other Value (gp)": 3,
        "Harvest DC": 10,
        "Notes": "About 2 gp teeth + 1 gp claws."
      },
      {
        "Animal": "Wolf",
        "Size": "Medium",
        "Leather / Hide": "Fur / leather",
        "Hide Weight (lb)": 5,
        "Hide Value (gp)": 6,
        "Other Harvestable Resources": "Teeth; claws",
        "Other Weight (lb)": 0.75,
        "Other Value (gp)": 3,
        "Harvest DC": 10,
        "Notes": "Pelt is more valuable intact."
      },
      {
        "Animal": "Dire Wolf",
        "Size": "Large",
        "Leather / Hide": "Heavy fur / leather",
        "Hide Weight (lb)": 12,
        "Hide Value (gp)": 18,
        "Other Harvestable Resources": "Large teeth; claws",
        "Other Weight (lb)": 2,
        "Other Value (gp)": 8,
        "Harvest DC": 12,
        "Notes": "Prestige pelt; useful for cloaks."
      },
      {
        "Animal": "Dog / Mastiff",
        "Size": "Medium",
        "Leather / Hide": "Leather",
        "Hide Weight (lb)": 4,
        "Hide Value (gp)": 2,
        "Other Harvestable Resources": "Teeth",
        "Other Weight (lb)": 0.4,
        "Other Value (gp)": 0.5,
        "Harvest DC": 8,
        "Notes": "Usually little legal market demand."
      },
      {
        "Animal": "Goat",
        "Size": "Medium",
        "Leather / Hide": "Leather",
        "Hide Weight (lb)": 4,
        "Hide Value (gp)": 2,
        "Other Harvestable Resources": "Horns; meat; sinew",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 1.5,
        "Harvest DC": 8,
        "Notes": "Common practical hide."
      },
      {
        "Animal": "Sheep",
        "Size": "Medium",
        "Leather / Hide": "Sheepskin / wool",
        "Hide Weight (lb)": 5,
        "Hide Value (gp)": 3,
        "Other Harvestable Resources": "Wool; meat; horn (ram)",
        "Other Weight (lb)": 8,
        "Other Value (gp)": 2,
        "Harvest DC": 8,
        "Notes": "Wool often worth more over animal's life."
      },
      {
        "Animal": "Pig / Boar",
        "Size": "Medium",
        "Leather / Hide": "Pigskin",
        "Hide Weight (lb)": 7,
        "Hide Value (gp)": 4,
        "Other Harvestable Resources": "Tusks; fat; bristles; meat",
        "Other Weight (lb)": 6,
        "Other Value (gp)": 2,
        "Harvest DC": 10,
        "Notes": "Boar tusks have decorative value."
      },
      {
        "Animal": "Giant Boar",
        "Size": "Large",
        "Leather / Hide": "Thick hide",
        "Hide Weight (lb)": 18,
        "Hide Value (gp)": 12,
        "Other Harvestable Resources": "Large tusks; fat; bristles",
        "Other Weight (lb)": 12,
        "Other Value (gp)": 8,
        "Harvest DC": 12,
        "Notes": "Good shield/armor crafting material."
      },
      {
        "Animal": "Deer",
        "Size": "Medium",
        "Leather / Hide": "Buckskin",
        "Hide Weight (lb)": 6,
        "Hide Value (gp)": 5,
        "Other Harvestable Resources": "Antlers; sinew; bone; meat",
        "Other Weight (lb)": 8,
        "Other Value (gp)": 4,
        "Harvest DC": 10,
        "Notes": "Versatile wilderness resource."
      },
      {
        "Animal": "Elk",
        "Size": "Large",
        "Leather / Hide": "Leather",
        "Hide Weight (lb)": 12,
        "Hide Value (gp)": 10,
        "Other Harvestable Resources": "Antlers; sinew; bone; meat",
        "Other Weight (lb)": 15,
        "Other Value (gp)": 8,
        "Harvest DC": 10,
        "Notes": "Large antlers can be valuable."
      },
      {
        "Animal": "Reindeer / Caribou",
        "Size": "Large",
        "Leather / Hide": "Leather / fur",
        "Hide Weight (lb)": 12,
        "Hide Value (gp)": 12,
        "Other Harvestable Resources": "Antlers; sinew; bone; meat",
        "Other Weight (lb)": 15,
        "Other Value (gp)": 8,
        "Harvest DC": 10,
        "Notes": "Cold-weather fur premium."
      },
      {
        "Animal": "Cow / Cattle",
        "Size": "Large",
        "Leather / Hide": "Cowhide",
        "Hide Weight (lb)": 20,
        "Hide Value (gp)": 10,
        "Other Harvestable Resources": "Horns; bone; tallow; meat",
        "Other Weight (lb)": 25,
        "Other Value (gp)": 5,
        "Harvest DC": 8,
        "Notes": "Benchmark common leather source."
      },
      {
        "Animal": "Ox",
        "Size": "Large",
        "Leather / Hide": "Heavy cowhide",
        "Hide Weight (lb)": 25,
        "Hide Value (gp)": 12,
        "Other Harvestable Resources": "Horns; bone; tallow; sinew",
        "Other Weight (lb)": 30,
        "Other Value (gp)": 6,
        "Harvest DC": 8,
        "Notes": "Thicker working leather."
      },
      {
        "Animal": "Horse",
        "Size": "Large",
        "Leather / Hide": "Horsehide",
        "Hide Weight (lb)": 18,
        "Hide Value (gp)": 8,
        "Other Harvestable Resources": "Hair; bone; sinew",
        "Other Weight (lb)": 12,
        "Other Value (gp)": 3,
        "Harvest DC": 10,
        "Notes": "Less valuable than cattle hide in many markets."
      },
      {
        "Animal": "Bison / Buffalo",
        "Size": "Large",
        "Leather / Hide": "Heavy hide / fur",
        "Hide Weight (lb)": 25,
        "Hide Value (gp)": 18,
        "Other Harvestable Resources": "Horns; bone; sinew; meat",
        "Other Weight (lb)": 35,
        "Other Value (gp)": 10,
        "Harvest DC": 12,
        "Notes": "Excellent blankets, leather and winter gear."
      },
      {
        "Animal": "Bear, Black",
        "Size": "Large",
        "Leather / Hide": "Fur / leather",
        "Hide Weight (lb)": 18,
        "Hide Value (gp)": 20,
        "Other Harvestable Resources": "Claws; teeth; fat; bile",
        "Other Weight (lb)": 8,
        "Other Value (gp)": 10,
        "Harvest DC": 12,
        "Notes": "Claws and pelt are trophies."
      },
      {
        "Animal": "Bear, Brown/Grizzly",
        "Size": "Large",
        "Leather / Hide": "Heavy fur / leather",
        "Hide Weight (lb)": 25,
        "Hide Value (gp)": 30,
        "Other Harvestable Resources": "Claws; teeth; fat; bile",
        "Other Weight (lb)": 12,
        "Other Value (gp)": 15,
        "Harvest DC": 14,
        "Notes": "Danger premium raises market value."
      },
      {
        "Animal": "Polar Bear",
        "Size": "Large",
        "Leather / Hide": "Dense white fur",
        "Hide Weight (lb)": 25,
        "Hide Value (gp)": 45,
        "Other Harvestable Resources": "Claws; teeth; fat",
        "Other Weight (lb)": 15,
        "Other Value (gp)": 15,
        "Harvest DC": 14,
        "Notes": "Rare cold-climate luxury pelt."
      },
      {
        "Animal": "Lion",
        "Size": "Large",
        "Leather / Hide": "Hide / mane",
        "Hide Weight (lb)": 15,
        "Hide Value (gp)": 25,
        "Other Harvestable Resources": "Teeth; claws; mane",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 12,
        "Harvest DC": 14,
        "Notes": "Prestige trophy material."
      },
      {
        "Animal": "Tiger",
        "Size": "Large",
        "Leather / Hide": "Striped pelt",
        "Hide Weight (lb)": 18,
        "Hide Value (gp)": 40,
        "Other Harvestable Resources": "Teeth; claws; whiskers",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 15,
        "Harvest DC": 14,
        "Notes": "Rare luxury pelt."
      },
      {
        "Animal": "Panther / Leopard",
        "Size": "Large",
        "Leather / Hide": "Spotted pelt",
        "Hide Weight (lb)": 12,
        "Hide Value (gp)": 30,
        "Other Harvestable Resources": "Teeth; claws; whiskers",
        "Other Weight (lb)": 2,
        "Other Value (gp)": 10,
        "Harvest DC": 14,
        "Notes": "Luxury pelt."
      },
      {
        "Animal": "Crocodile",
        "Size": "Large",
        "Leather / Hide": "Scaled leather",
        "Hide Weight (lb)": 8,
        "Hide Value (gp)": 25,
        "Other Harvestable Resources": "Teeth; claws; skull",
        "Other Weight (lb)": 5,
        "Other Value (gp)": 8,
        "Harvest DC": 12,
        "Notes": "Durable exotic leather."
      },
      {
        "Animal": "Giant Crocodile",
        "Size": "Huge",
        "Leather / Hide": "Heavy scaled leather",
        "Hide Weight (lb)": 35,
        "Hide Value (gp)": 80,
        "Other Harvestable Resources": "Large teeth; claws; skull",
        "Other Weight (lb)": 20,
        "Other Value (gp)": 30,
        "Harvest DC": 16,
        "Notes": "Enough hide for multiple large projects."
      },
      {
        "Animal": "Alligator",
        "Size": "Large",
        "Leather / Hide": "Scaled leather",
        "Hide Weight (lb)": 9,
        "Hide Value (gp)": 25,
        "Other Harvestable Resources": "Teeth; claws; skull",
        "Other Weight (lb)": 5,
        "Other Value (gp)": 8,
        "Harvest DC": 12,
        "Notes": "Treat as crocodile."
      },
      {
        "Animal": "Giant Lizard",
        "Size": "Large",
        "Leather / Hide": "Scaled leather",
        "Hide Weight (lb)": 12,
        "Hide Value (gp)": 15,
        "Other Harvestable Resources": "Teeth; claws; glands",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 5,
        "Harvest DC": 12,
        "Notes": "Common fantasy reptile material."
      },
      {
        "Animal": "Giant Snake",
        "Size": "Huge",
        "Leather / Hide": "Snakeskin",
        "Hide Weight (lb)": 20,
        "Hide Value (gp)": 30,
        "Other Harvestable Resources": "Fangs; venom gland; meat",
        "Other Weight (lb)": 4,
        "Other Value (gp)": 15,
        "Harvest DC": 14,
        "Notes": "Venom value assumes intact gland."
      },
      {
        "Animal": "Constrictor Snake",
        "Size": "Large",
        "Leather / Hide": "Snakeskin",
        "Hide Weight (lb)": 7,
        "Hide Value (gp)": 8,
        "Other Harvestable Resources": "Fangs; meat",
        "Other Weight (lb)": 2,
        "Other Value (gp)": 2,
        "Harvest DC": 10,
        "Notes": "Decorative skin."
      },
      {
        "Animal": "Venomous Snake",
        "Size": "Tiny",
        "Leather / Hide": "Snakeskin",
        "Hide Weight (lb)": 0.2,
        "Hide Value (gp)": 0.5,
        "Other Harvestable Resources": "Fangs; venom",
        "Other Weight (lb)": 0.1,
        "Other Value (gp)": 3,
        "Harvest DC": 12,
        "Notes": "Venom requires careful extraction."
      },
      {
        "Animal": "Giant Poisonous Snake",
        "Size": "Medium",
        "Leather / Hide": "Snakeskin",
        "Hide Weight (lb)": 3,
        "Hide Value (gp)": 6,
        "Other Harvestable Resources": "Fangs; venom glands",
        "Other Weight (lb)": 0.5,
        "Other Value (gp)": 12,
        "Harvest DC": 14,
        "Notes": "Venom is the valuable component."
      },
      {
        "Animal": "Komodo / Giant Monitor",
        "Size": "Large",
        "Leather / Hide": "Scaled leather",
        "Hide Weight (lb)": 10,
        "Hide Value (gp)": 15,
        "Other Harvestable Resources": "Teeth; claws; venom/saliva glands",
        "Other Weight (lb)": 2,
        "Other Value (gp)": 6,
        "Harvest DC": 13,
        "Notes": "Rugged reptile hide."
      },
      {
        "Animal": "Turtle",
        "Size": "Small",
        "Leather / Hide": "Skin",
        "Hide Weight (lb)": 0.5,
        "Hide Value (gp)": 0.3,
        "Other Harvestable Resources": "Shell; meat",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 1,
        "Harvest DC": 8,
        "Notes": "Shell useful for small craftwork."
      },
      {
        "Animal": "Giant Turtle",
        "Size": "Huge",
        "Leather / Hide": "Thick skin",
        "Hide Weight (lb)": 25,
        "Hide Value (gp)": 15,
        "Other Harvestable Resources": "Shell plates; bone",
        "Other Weight (lb)": 60,
        "Other Value (gp)": 25,
        "Harvest DC": 14,
        "Notes": "Shell is cumbersome but useful."
      },
      {
        "Animal": "Elephant",
        "Size": "Huge",
        "Leather / Hide": "Thick hide",
        "Hide Weight (lb)": 60,
        "Hide Value (gp)": 40,
        "Other Harvestable Resources": "Tusks (ivory); bone; hair",
        "Other Weight (lb)": 80,
        "Other Value (gp)": 100,
        "Harvest DC": 15,
        "Notes": "Ivory value can vary drastically by setting."
      },
      {
        "Animal": "Mammoth",
        "Size": "Huge",
        "Leather / Hide": "Hide / fur",
        "Hide Weight (lb)": 80,
        "Hide Value (gp)": 75,
        "Other Harvestable Resources": "Tusks; bone; hair",
        "Other Weight (lb)": 120,
        "Other Value (gp)": 180,
        "Harvest DC": 16,
        "Notes": "Huge cold-weather pelt and ivory yield."
      },
      {
        "Animal": "Rhinoceros",
        "Size": "Large",
        "Leather / Hide": "Thick hide",
        "Hide Weight (lb)": 30,
        "Hide Value (gp)": 30,
        "Other Harvestable Resources": "Horn; bone",
        "Other Weight (lb)": 12,
        "Other Value (gp)": 30,
        "Harvest DC": 15,
        "Notes": "Horn value is setting-dependent."
      },
      {
        "Animal": "Hippopotamus",
        "Size": "Huge",
        "Leather / Hide": "Thick hide",
        "Hide Weight (lb)": 40,
        "Hide Value (gp)": 25,
        "Other Harvestable Resources": "Teeth; fat; bone",
        "Other Weight (lb)": 20,
        "Other Value (gp)": 15,
        "Harvest DC": 14,
        "Notes": "Very thick hide."
      },
      {
        "Animal": "Camel",
        "Size": "Large",
        "Leather / Hide": "Leather",
        "Hide Weight (lb)": 15,
        "Hide Value (gp)": 8,
        "Other Harvestable Resources": "Hair; bone; fat",
        "Other Weight (lb)": 10,
        "Other Value (gp)": 3,
        "Harvest DC": 8,
        "Notes": "Practical desert leather."
      },
      {
        "Animal": "Giant Goat",
        "Size": "Large",
        "Leather / Hide": "Leather",
        "Hide Weight (lb)": 10,
        "Hide Value (gp)": 8,
        "Other Harvestable Resources": "Horns; sinew; meat",
        "Other Weight (lb)": 8,
        "Other Value (gp)": 4,
        "Harvest DC": 10,
        "Notes": "Large horns useful for crafting."
      },
      {
        "Animal": "Axe Beak",
        "Size": "Large",
        "Leather / Hide": "Feathered skin",
        "Hide Weight (lb)": 6,
        "Hide Value (gp)": 5,
        "Other Harvestable Resources": "Feathers; beak; claws",
        "Other Weight (lb)": 8,
        "Other Value (gp)": 6,
        "Harvest DC": 10,
        "Notes": "Feathers and beak are more useful than skin."
      },
      {
        "Animal": "Giant Eagle",
        "Size": "Large",
        "Leather / Hide": "Skin",
        "Hide Weight (lb)": 5,
        "Hide Value (gp)": 8,
        "Other Harvestable Resources": "Flight feathers; talons; beak",
        "Other Weight (lb)": 6,
        "Other Value (gp)": 20,
        "Harvest DC": 15,
        "Notes": "Rare feathers prized for fletching/rituals."
      },
      {
        "Animal": "Giant Owl",
        "Size": "Large",
        "Leather / Hide": "Skin",
        "Hide Weight (lb)": 5,
        "Hide Value (gp)": 8,
        "Other Harvestable Resources": "Feathers; talons; beak",
        "Other Weight (lb)": 5,
        "Other Value (gp)": 15,
        "Harvest DC": 14,
        "Notes": "Silent-flight feathers have specialist demand."
      },
      {
        "Animal": "Giant Vulture",
        "Size": "Large",
        "Leather / Hide": "Skin",
        "Hide Weight (lb)": 6,
        "Hide Value (gp)": 3,
        "Other Harvestable Resources": "Feathers; talons; beak",
        "Other Weight (lb)": 6,
        "Other Value (gp)": 5,
        "Harvest DC": 12,
        "Notes": "Low-value skin, useful feathers."
      },
      {
        "Animal": "Giant Bat",
        "Size": "Large",
        "Leather / Hide": "Wing membrane / hide",
        "Hide Weight (lb)": 5,
        "Hide Value (gp)": 6,
        "Other Harvestable Resources": "Fangs; claws; guano",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 4,
        "Harvest DC": 12,
        "Notes": "Membrane useful for specialty leatherwork."
      },
      {
        "Animal": "Giant Frog",
        "Size": "Medium",
        "Leather / Hide": "Amphibian hide",
        "Hide Weight (lb)": 3,
        "Hide Value (gp)": 2,
        "Other Harvestable Resources": "Tongue; glands; meat",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 2,
        "Harvest DC": 10,
        "Notes": "Mostly alchemical/cooking use."
      },
      {
        "Animal": "Giant Toad",
        "Size": "Large",
        "Leather / Hide": "Amphibian hide",
        "Hide Weight (lb)": 6,
        "Hide Value (gp)": 4,
        "Other Harvestable Resources": "Poison glands; tongue",
        "Other Weight (lb)": 3,
        "Other Value (gp)": 8,
        "Harvest DC": 13,
        "Notes": "Glands are main value."
      },
      {
        "Animal": "Giant Crab",
        "Size": "Medium",
        "Leather / Hide": "Chitin / shell",
        "Hide Weight (lb)": 8,
        "Hide Value (gp)": 4,
        "Other Harvestable Resources": "Claws; meat",
        "Other Weight (lb)": 8,
        "Other Value (gp)": 2,
        "Harvest DC": 10,
        "Notes": "Carapace substitutes for hide in crafting."
      },
      {
        "Animal": "Giant Scorpion",
        "Size": "Large",
        "Leather / Hide": "Chitin",
        "Hide Weight (lb)": 15,
        "Hide Value (gp)": 12,
        "Other Harvestable Resources": "Stinger; venom gland; pincers",
        "Other Weight (lb)": 8,
        "Other Value (gp)": 20,
        "Harvest DC": 16,
        "Notes": "Venom requires careful harvest."
      },
      {
        "Animal": "Giant Spider",
        "Size": "Large",
        "Leather / Hide": "Chitin / skin",
        "Hide Weight (lb)": 8,
        "Hide Value (gp)": 8,
        "Other Harvestable Resources": "Venom glands; silk",
        "Other Weight (lb)": 5,
        "Other Value (gp)": 18,
        "Harvest DC": 15,
        "Notes": "Silk and venom drive value."
      },
      {
        "Animal": "Giant Centipede",
        "Size": "Small",
        "Leather / Hide": "Chitin",
        "Hide Weight (lb)": 1,
        "Hide Value (gp)": 0.5,
        "Other Harvestable Resources": "Venom gland",
        "Other Weight (lb)": 0.1,
        "Other Value (gp)": 2,
        "Harvest DC": 12,
        "Notes": "Small quantities."
      },
      {
        "Animal": "Giant Wasp",
        "Size": "Medium",
        "Leather / Hide": "Chitin",
        "Hide Weight (lb)": 3,
        "Hide Value (gp)": 2,
        "Other Harvestable Resources": "Stinger; venom; wings",
        "Other Weight (lb)": 1,
        "Other Value (gp)": 5,
        "Harvest DC": 13,
        "Notes": "Fragile wings have alchemical use."
      }
    ]
  },
  {
    "key": "harvestRules",
    "label": "Правила (Harvest)",
    "group": "Harvesting",
    "type": "info",
    "entries": [
      {
        "k": "Purpose",
        "v": "Homebrew D&D 5e harvesting/economy reference. Values are suggested campaign prices, not official monster-loot prices."
      },
      {
        "k": "Baseline",
        "v": "Official 5e leather armor costs 10 gp and weighs 10 lb; hide armor costs 10 gp and weighs 12 lb. These are finished armor prices, so harvested material values are deliberately approximate."
      },
      {
        "k": "Harvest DC",
        "v": "Use Wisdom (Survival), leatherworker's tools, poisoner's kit, or another appropriate proficiency. DC reflects difficulty of removing the valuable part intact."
      },
      {
        "k": "Failure",
        "v": "Suggested: fail by 1–4 = half value; fail by 5+ = resource ruined; natural 20 = exceptional specimen worth +25–50%."
      },
      {
        "k": "Raw vs tanned",
        "v": "Table hide values assume a usable, properly preserved/tanned hide. Fresh raw hides can sell for roughly 25–50% less if the buyer must process them."
      },
      {
        "k": "Meat",
        "v": "Meat is intentionally not priced in most rows. Use local food prices and spoilage; this sheet focuses on durable crafting/trade resources."
      },
      {
        "k": "Scale",
        "v": "For an unlisted mundane animal, use the closest comparable animal by size, danger, rarity and hide quality."
      },
      {
        "k": "Official reference",
        "v": "https://media.wizards.com/2018/dnd/downloads/DnD_BasicRules_2018.pdf"
      },
      {
        "k": "SRD trade goods reference",
        "v": "https://5e.d20srd.org/srd/equipment/equipment.htm"
      }
    ]
  },
  {
    "key": "ingredients",
    "label": "Съставки",
    "group": "Алхимия",
    "type": "table",
    "nameCol": "Property",
    "badgeCol": null,
    "filterable": false,
    "columns": [
      "Property",
      "Typical Sources",
      "Likely Effects",
      "Notes"
    ],
    "rows": [
      {
        "Property": "Vitality",
        "Typical Sources": "Blood, heart, liver, medicinal herbs",
        "Likely Effects": "Healing, regeneration, temporary HP",
        "Notes": "Best for restorative brews"
      },
      {
        "Property": "Predator",
        "Typical Sources": "Fangs, claws, predator blood",
        "Likely Effects": "Strength, speed, enhanced attacks",
        "Notes": "Aggressive physical effects"
      },
      {
        "Property": "Venom",
        "Typical Sources": "Snake/spider/scorpion venom",
        "Likely Effects": "Poison, resistance, paralysis",
        "Notes": "Can create toxins or antidotes"
      },
      {
        "Property": "Sensory",
        "Typical Sources": "Eyes, whiskers, antennae",
        "Likely Effects": "Darkvision, perception, detection",
        "Notes": "Higher tiers can reveal hidden creatures"
      },
      {
        "Property": "Carapace",
        "Typical Sources": "Shells, scales, chitin, thick hides",
        "Likely Effects": "AC, resistance, durability",
        "Notes": "Protective effects"
      },
      {
        "Property": "Aerial",
        "Typical Sources": "Feathers, wings, air sacs",
        "Likely Effects": "Jumping, feather fall, flight",
        "Notes": "Flight requires high-value ingredients"
      },
      {
        "Property": "Aquatic",
        "Typical Sources": "Gills, fish scales, amphibian organs",
        "Likely Effects": "Water breathing, swimming",
        "Notes": "Useful in exploration"
      },
      {
        "Property": "Arcane",
        "Typical Sources": "Magical creature organs, magical dust",
        "Likely Effects": "Spell effects, magical enhancement",
        "Notes": "Highly variable"
      },
      {
        "Property": "Necrotic",
        "Typical Sources": "Undead flesh, grave moss, vampire blood",
        "Likely Effects": "Necrotic effects, false life, resistance",
        "Notes": "Often carries side effects"
      },
      {
        "Property": "Radiant",
        "Typical Sources": "Blessed materials, celestial remains",
        "Likely Effects": "Healing, radiant damage, purification",
        "Notes": "Useful against corruption/undead"
      },
      {
        "Property": "Infernal",
        "Typical Sources": "Fiend blood, horns, ichor",
        "Likely Effects": "Fire, strength, fear",
        "Notes": "Powerful but risky"
      },
      {
        "Property": "Fey",
        "Typical Sources": "Fey blood, enchanted flowers, wings",
        "Likely Effects": "Charm, invisibility, transformation",
        "Notes": "Often unpredictable"
      },
      {
        "Property": "Psychic",
        "Typical Sources": "Aberration brain, eyes, neural tissue",
        "Likely Effects": "Telepathy, mind reading, psychic effects",
        "Notes": "Can affect sanity/memory"
      },
      {
        "Property": "Elemental",
        "Typical Sources": "Elemental organs, crystals, essence",
        "Likely Effects": "Fire/cold/lightning/acid effects",
        "Notes": "Element determines damage type"
      },
      {
        "Property": "Transformative",
        "Typical Sources": "Shapeshifter tissue, troll blood",
        "Likely Effects": "Alteration, growth, regeneration, mutation",
        "Notes": "Most mutation-prone category"
      }
    ]
  },
  {
    "key": "brewing",
    "label": "Brewing DC",
    "group": "Алхимия",
    "type": "table",
    "nameCol": "Ingredient Value",
    "badgeCol": "Potion Tier",
    "filterable": true,
    "columns": [
      "Ingredient Value",
      "Potion Tier",
      "Base DC"
    ],
    "rows": [
      {
        "Ingredient Value": "10–25 gp",
        "Potion Tier": "Minor / Common",
        "Base DC": 10
      },
      {
        "Ingredient Value": "25–50 gp",
        "Potion Tier": "Common",
        "Base DC": 12
      },
      {
        "Ingredient Value": "50–100 gp",
        "Potion Tier": "Uncommon",
        "Base DC": 14
      },
      {
        "Ingredient Value": "100–250 gp",
        "Potion Tier": "Strong Uncommon",
        "Base DC": 16
      },
      {
        "Ingredient Value": "250–500 gp",
        "Potion Tier": "Rare",
        "Base DC": 18
      },
      {
        "Ingredient Value": "500–1,000 gp",
        "Potion Tier": "Rare",
        "Base DC": 20
      },
      {
        "Ingredient Value": "1,000–2,500 gp",
        "Potion Tier": "Very Rare",
        "Base DC": 23
      },
      {
        "Ingredient Value": "2,500+ gp",
        "Potion Tier": "Very Rare / Experimental",
        "Base DC": 25
      }
    ]
  },
  {
    "key": "brewResults",
    "label": "Резултат от варене",
    "group": "Алхимия",
    "type": "table",
    "nameCol": "Brewing Roll",
    "badgeCol": null,
    "filterable": false,
    "columns": [
      "Brewing Roll",
      "Result"
    ],
    "rows": [
      {
        "Brewing Roll": "Natural 1",
        "Result": "Catastrophic reaction"
      },
      {
        "Brewing Roll": "Fail by 10+",
        "Result": "Dangerous failure"
      },
      {
        "Brewing Roll": "Fail by 5–9",
        "Result": "Failed potion"
      },
      {
        "Brewing Roll": "Fail by 1–4",
        "Result": "Unstable potion"
      },
      {
        "Brewing Roll": "Meet DC",
        "Result": "Successful potion"
      },
      {
        "Brewing Roll": "Beat DC by 5+",
        "Result": "Improved result"
      },
      {
        "Brewing Roll": "Beat DC by 10+",
        "Result": "Exceptional result"
      },
      {
        "Brewing Roll": "Natural 20",
        "Result": "Experimental breakthrough"
      }
    ]
  },
  {
    "key": "outcomes",
    "label": "Ефекти (d6)",
    "group": "Алхимия",
    "type": "table",
    "nameCol": "Possible Outcome",
    "badgeCol": "Property",
    "filterable": true,
    "columns": [
      "Property",
      "d6",
      "Possible Outcome"
    ],
    "rows": [
      {
        "Property": "Vitality",
        "d6": 1,
        "Possible Outcome": "Minor healing"
      },
      {
        "Property": "Vitality",
        "d6": 2,
        "Possible Outcome": "Healing over time"
      },
      {
        "Property": "Vitality",
        "d6": 3,
        "Possible Outcome": "Temporary HP"
      },
      {
        "Property": "Vitality",
        "d6": 4,
        "Possible Outcome": "Disease/poison recovery"
      },
      {
        "Property": "Vitality",
        "d6": 5,
        "Possible Outcome": "Major healing"
      },
      {
        "Property": "Vitality",
        "d6": 6,
        "Possible Outcome": "Regeneration"
      },
      {
        "Property": "Predator",
        "d6": 1,
        "Possible Outcome": "Increased movement speed"
      },
      {
        "Property": "Predator",
        "d6": 2,
        "Possible Outcome": "Advantage on Athletics"
      },
      {
        "Property": "Predator",
        "d6": 3,
        "Possible Outcome": "Enhanced Strength"
      },
      {
        "Property": "Predator",
        "d6": 4,
        "Possible Outcome": "Enhanced Dexterity"
      },
      {
        "Property": "Predator",
        "d6": 5,
        "Possible Outcome": "Natural weapon enhancement"
      },
      {
        "Property": "Predator",
        "d6": 6,
        "Possible Outcome": "Potion of Speed-like effect"
      },
      {
        "Property": "Venom",
        "d6": 1,
        "Possible Outcome": "Potion of Poison"
      },
      {
        "Property": "Venom",
        "d6": 2,
        "Possible Outcome": "Antitoxin"
      },
      {
        "Property": "Venom",
        "d6": 3,
        "Possible Outcome": "Poison resistance"
      },
      {
        "Property": "Venom",
        "d6": 4,
        "Possible Outcome": "Weapon poison"
      },
      {
        "Property": "Venom",
        "d6": 5,
        "Possible Outcome": "Paralytic compound"
      },
      {
        "Property": "Venom",
        "d6": 6,
        "Possible Outcome": "Poison immunity"
      },
      {
        "Property": "Sensory",
        "d6": 1,
        "Possible Outcome": "Advantage on Perception"
      },
      {
        "Property": "Sensory",
        "d6": 2,
        "Possible Outcome": "Darkvision"
      },
      {
        "Property": "Sensory",
        "d6": 3,
        "Possible Outcome": "Enhanced smell/hearing"
      },
      {
        "Property": "Sensory",
        "d6": 4,
        "Possible Outcome": "See Invisibility-like effect"
      },
      {
        "Property": "Sensory",
        "d6": 5,
        "Possible Outcome": "Tremorsense"
      },
      {
        "Property": "Sensory",
        "d6": 6,
        "Possible Outcome": "Truesight-like effect"
      },
      {
        "Property": "Carapace",
        "d6": 1,
        "Possible Outcome": "+1 AC temporarily"
      },
      {
        "Property": "Carapace",
        "d6": 2,
        "Possible Outcome": "Temporary HP"
      },
      {
        "Property": "Carapace",
        "d6": 3,
        "Possible Outcome": "Slashing resistance"
      },
      {
        "Property": "Carapace",
        "d6": 4,
        "Possible Outcome": "Piercing resistance"
      },
      {
        "Property": "Carapace",
        "d6": 5,
        "Possible Outcome": "Bludgeoning resistance"
      },
      {
        "Property": "Carapace",
        "d6": 6,
        "Possible Outcome": "Stoneskin-like effect"
      },
      {
        "Property": "Aerial",
        "d6": 1,
        "Possible Outcome": "Enhanced jump"
      },
      {
        "Property": "Aerial",
        "d6": 2,
        "Possible Outcome": "Reduced falling damage"
      },
      {
        "Property": "Aerial",
        "d6": 3,
        "Possible Outcome": "Feather Fall-like effect"
      },
      {
        "Property": "Aerial",
        "d6": 4,
        "Possible Outcome": "Gliding"
      },
      {
        "Property": "Aerial",
        "d6": 5,
        "Possible Outcome": "Short flight"
      },
      {
        "Property": "Aerial",
        "d6": 6,
        "Possible Outcome": "Full flight"
      },
      {
        "Property": "Aquatic",
        "d6": 1,
        "Possible Outcome": "Hold breath longer"
      },
      {
        "Property": "Aquatic",
        "d6": 2,
        "Possible Outcome": "Swim speed"
      },
      {
        "Property": "Aquatic",
        "d6": 3,
        "Possible Outcome": "Underwater perception"
      },
      {
        "Property": "Aquatic",
        "d6": 4,
        "Possible Outcome": "Water breathing"
      },
      {
        "Property": "Aquatic",
        "d6": 5,
        "Possible Outcome": "Amphibious adaptation"
      },
      {
        "Property": "Aquatic",
        "d6": 6,
        "Possible Outcome": "Superior aquatic transformation"
      },
      {
        "Property": "Arcane",
        "d6": 1,
        "Possible Outcome": "Cantrip-like effect"
      },
      {
        "Property": "Arcane",
        "d6": 2,
        "Possible Outcome": "Spell enhancement"
      },
      {
        "Property": "Arcane",
        "d6": 3,
        "Possible Outcome": "Restore minor magical resource"
      },
      {
        "Property": "Arcane",
        "d6": 4,
        "Possible Outcome": "Random spell effect"
      },
      {
        "Property": "Arcane",
        "d6": 5,
        "Possible Outcome": "Spell resistance"
      },
      {
        "Property": "Arcane",
        "d6": 6,
        "Possible Outcome": "Potent magical transformation"
      },
      {
        "Property": "Necrotic",
        "d6": 1,
        "Possible Outcome": "False life"
      },
      {
        "Property": "Necrotic",
        "d6": 2,
        "Possible Outcome": "Necrotic damage boost"
      },
      {
        "Property": "Necrotic",
        "d6": 3,
        "Possible Outcome": "Necrotic resistance"
      },
      {
        "Property": "Necrotic",
        "d6": 4,
        "Possible Outcome": "Undead detection/control"
      },
      {
        "Property": "Necrotic",
        "d6": 5,
        "Possible Outcome": "Life-drain effect"
      },
      {
        "Property": "Necrotic",
        "d6": 6,
        "Possible Outcome": "Powerful deathly transformation"
      },
      {
        "Property": "Radiant",
        "d6": 1,
        "Possible Outcome": "Minor healing"
      },
      {
        "Property": "Radiant",
        "d6": 2,
        "Possible Outcome": "Radiant weapon coating"
      },
      {
        "Property": "Radiant",
        "d6": 3,
        "Possible Outcome": "Purification"
      },
      {
        "Property": "Radiant",
        "d6": 4,
        "Possible Outcome": "Radiant resistance"
      },
      {
        "Property": "Radiant",
        "d6": 5,
        "Possible Outcome": "Greater restoration-like effect"
      },
      {
        "Property": "Radiant",
        "d6": 6,
        "Possible Outcome": "Powerful anti-undead effect"
      },
      {
        "Property": "Infernal",
        "d6": 1,
        "Possible Outcome": "Fire resistance"
      },
      {
        "Property": "Infernal",
        "d6": 2,
        "Possible Outcome": "Fire damage boost"
      },
      {
        "Property": "Infernal",
        "d6": 3,
        "Possible Outcome": "Fear effect"
      },
      {
        "Property": "Infernal",
        "d6": 4,
        "Possible Outcome": "Enhanced Strength"
      },
      {
        "Property": "Infernal",
        "d6": 5,
        "Possible Outcome": "Infernal transformation"
      },
      {
        "Property": "Infernal",
        "d6": 6,
        "Possible Outcome": "Major fiendish power with drawback"
      },
      {
        "Property": "Fey",
        "d6": 1,
        "Possible Outcome": "Minor charm"
      },
      {
        "Property": "Fey",
        "d6": 2,
        "Possible Outcome": "Enhanced charisma"
      },
      {
        "Property": "Fey",
        "d6": 3,
        "Possible Outcome": "Invisibility"
      },
      {
        "Property": "Fey",
        "d6": 4,
        "Possible Outcome": "Alter Self-like effect"
      },
      {
        "Property": "Fey",
        "d6": 5,
        "Possible Outcome": "Misty Step-like effect"
      },
      {
        "Property": "Fey",
        "d6": 6,
        "Possible Outcome": "Major fey transformation"
      },
      {
        "Property": "Psychic",
        "d6": 1,
        "Possible Outcome": "Mental clarity"
      },
      {
        "Property": "Psychic",
        "d6": 2,
        "Possible Outcome": "Psychic resistance"
      },
      {
        "Property": "Psychic",
        "d6": 3,
        "Possible Outcome": "Telepathy"
      },
      {
        "Property": "Psychic",
        "d6": 4,
        "Possible Outcome": "Detect thoughts-like effect"
      },
      {
        "Property": "Psychic",
        "d6": 5,
        "Possible Outcome": "Psychic attack"
      },
      {
        "Property": "Psychic",
        "d6": 6,
        "Possible Outcome": "Powerful mind alteration"
      },
      {
        "Property": "Elemental",
        "d6": 1,
        "Possible Outcome": "Minor elemental resistance"
      },
      {
        "Property": "Elemental",
        "d6": 2,
        "Possible Outcome": "Elemental weapon coating"
      },
      {
        "Property": "Elemental",
        "d6": 3,
        "Possible Outcome": "Elemental damage"
      },
      {
        "Property": "Elemental",
        "d6": 4,
        "Possible Outcome": "Strong elemental resistance"
      },
      {
        "Property": "Elemental",
        "d6": 5,
        "Possible Outcome": "Elemental aura"
      },
      {
        "Property": "Elemental",
        "d6": 6,
        "Possible Outcome": "Major elemental transformation"
      },
      {
        "Property": "Transformative",
        "d6": 1,
        "Possible Outcome": "Cosmetic mutation"
      },
      {
        "Property": "Transformative",
        "d6": 2,
        "Possible Outcome": "Enhanced physical trait"
      },
      {
        "Property": "Transformative",
        "d6": 3,
        "Possible Outcome": "Alter Self-like effect"
      },
      {
        "Property": "Transformative",
        "d6": 4,
        "Possible Outcome": "Growth/shrink effect"
      },
      {
        "Property": "Transformative",
        "d6": 5,
        "Possible Outcome": "Regeneration"
      },
      {
        "Property": "Transformative",
        "d6": 6,
        "Possible Outcome": "Major controlled transformation"
      }
    ]
  },
  {
    "key": "hybrid",
    "label": "Хибриди (d6)",
    "group": "Алхимия",
    "type": "table",
    "nameCol": "Dominance",
    "badgeCol": "d6",
    "filterable": false,
    "columns": [
      "d6",
      "Dominance",
      "Result"
    ],
    "rows": [
      {
        "d6": 1,
        "Dominance": "Property A dominates",
        "Result": "Resolve using first ingredient property's outcome table"
      },
      {
        "d6": 2,
        "Dominance": "Property B dominates",
        "Result": "Resolve using second ingredient property's outcome table"
      },
      {
        "d6": 3,
        "Dominance": "Most valuable property dominates",
        "Result": "Use the property represented by the highest ingredient value"
      },
      {
        "d6": 4,
        "Dominance": "A + B hybrid",
        "Result": "Combine weakened versions of both effects"
      },
      {
        "d6": 5,
        "Dominance": "Synergistic hybrid",
        "Result": "Create one custom effect inspired by both properties"
      },
      {
        "d6": 6,
        "Dominance": "Full combination",
        "Result": "Combine all major properties; strongest chance of mutation or unique potion"
      }
    ]
  },
  {
    "key": "failures",
    "label": "Провали (d12)",
    "group": "Алхимия",
    "type": "table",
    "nameCol": "Failure Type",
    "badgeCol": "d12",
    "filterable": false,
    "columns": [
      "d12",
      "Failure Type",
      "Effect"
    ],
    "rows": [
      {
        "d12": 1,
        "Failure Type": "Explosion",
        "Effect": "Brewer and nearby creatures take minor elemental/alchemical damage"
      },
      {
        "d12": 2,
        "Failure Type": "Toxic fumes",
        "Effect": "Constitution save or poisoned temporarily"
      },
      {
        "d12": 3,
        "Failure Type": "Mutation",
        "Effect": "Temporary cosmetic or physical mutation"
      },
      {
        "d12": 4,
        "Failure Type": "Reversed effect",
        "Effect": "Potion produces the conceptual opposite of intended effect"
      },
      {
        "d12": 5,
        "Failure Type": "Delayed reaction",
        "Effect": "Potion appears inert, activates later"
      },
      {
        "d12": 6,
        "Failure Type": "Unstable duration",
        "Effect": "Effect lasts much shorter or longer than expected"
      },
      {
        "d12": 7,
        "Failure Type": "Addictive brew",
        "Effect": "Repeated use risks craving or dependency"
      },
      {
        "d12": 8,
        "Failure Type": "Corruption",
        "Effect": "Potion gains a necrotic, infernal, or other corrupting side effect"
      },
      {
        "d12": 9,
        "Failure Type": "Volatile dose",
        "Effect": "Works, but causes damage or exhaustion afterward"
      },
      {
        "d12": 10,
        "Failure Type": "Wrong target",
        "Effect": "Effect applies to an unexpected stat, sense, or body function"
      },
      {
        "d12": 11,
        "Failure Type": "Living potion",
        "Effect": "Mixture moves, reacts, whispers, or attempts escape"
      },
      {
        "d12": 12,
        "Failure Type": "Strange success",
        "Effect": "Potion works but gains one bizarre beneficial or harmful secondary effect"
      }
    ]
  },
  {
    "key": "ident",
    "label": "Идентификация",
    "group": "Алхимия",
    "type": "table",
    "nameCol": "Check",
    "badgeCol": "DC / Trigger",
    "filterable": false,
    "columns": [
      "Check",
      "DC / Trigger",
      "Information Learned"
    ],
    "rows": [
      {
        "Check": "Basic inspection",
        "DC / Trigger": "DC 10",
        "Information Learned": "Broad category / dominant property"
      },
      {
        "Check": "Careful analysis",
        "DC / Trigger": "DC 15",
        "Information Learned": "Primary effect"
      },
      {
        "Check": "Full alchemical analysis",
        "DC / Trigger": "DC 20",
        "Information Learned": "Exact mechanics and duration"
      },
      {
        "Check": "Critical success",
        "DC / Trigger": "Natural 20",
        "Information Learned": "Exact mechanics plus hidden side effects"
      },
      {
        "Check": "Critical failure",
        "DC / Trigger": "Natural 1",
        "Information Learned": "Confidently incorrect identification"
      }
    ]
  },
  {
    "key": "materials",
    "label": "Суровини",
    "group": "Икономика",
    "type": "table",
    "nameCol": "Raw Material",
    "badgeCol": "Rarity",
    "filterable": true,
    "columns": [
      "Raw Material",
      "Category",
      "Raw Value / lb (gp)",
      "Refining Cost / lb (gp)",
      "Weight Yield",
      "Rarity",
      "Typical Refined Product / Notes"
    ],
    "rows": [
      {
        "Raw Material": "Common soil",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.0002,
        "Refining Cost / lb (gp)": 0,
        "Weight Yield": 1,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Fill / packed earth"
      },
      {
        "Raw Material": "Clay",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.005,
        "Refining Cost / lb (gp)": 0.01,
        "Weight Yield": 0.85,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Worked/fired clay"
      },
      {
        "Raw Material": "Sand",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.002,
        "Refining Cost / lb (gp)": 0.03,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Clean sand / glass feedstock"
      },
      {
        "Raw Material": "Gravel",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.002,
        "Refining Cost / lb (gp)": 0.002,
        "Weight Yield": 0.95,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Sorted gravel"
      },
      {
        "Raw Material": "Chalk",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.01,
        "Refining Cost / lb (gp)": 0.01,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Ground chalk"
      },
      {
        "Raw Material": "Limestone",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.01,
        "Refining Cost / lb (gp)": 0.02,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Dressed limestone / lime"
      },
      {
        "Raw Material": "Sandstone",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.015,
        "Refining Cost / lb (gp)": 0.025,
        "Weight Yield": 0.75,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Dressed sandstone"
      },
      {
        "Raw Material": "Slate",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.02,
        "Refining Cost / lb (gp)": 0.03,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Roofing / dressed slate"
      },
      {
        "Raw Material": "Granite",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.025,
        "Refining Cost / lb (gp)": 0.05,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Dressed granite"
      },
      {
        "Raw Material": "Basalt",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.025,
        "Refining Cost / lb (gp)": 0.05,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Dressed basalt"
      },
      {
        "Raw Material": "Marble",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.05,
        "Refining Cost / lb (gp)": 0.2,
        "Weight Yield": 0.65,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Dressed/polished marble"
      },
      {
        "Raw Material": "Soapstone",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.04,
        "Refining Cost / lb (gp)": 0.06,
        "Weight Yield": 0.8,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Carved stone"
      },
      {
        "Raw Material": "Flint",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.05,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.5,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Knapped flint"
      },
      {
        "Raw Material": "Obsidian",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.2,
        "Refining Cost / lb (gp)": 0.5,
        "Weight Yield": 0.5,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Craft-grade obsidian"
      },
      {
        "Raw Material": "Pumice",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.03,
        "Refining Cost / lb (gp)": 0.02,
        "Weight Yield": 0.9,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Sorted pumice"
      },
      {
        "Raw Material": "Alabaster",
        "Category": "Earth & Stone",
        "Raw Value / lb (gp)": 0.1,
        "Refining Cost / lb (gp)": 0.2,
        "Weight Yield": 0.65,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Carved/polished alabaster"
      },
      {
        "Raw Material": "Sulfur",
        "Category": "Mineral & Chemical",
        "Raw Value / lb (gp)": 0.1,
        "Refining Cost / lb (gp)": 0.05,
        "Weight Yield": 0.8,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Purified sulfur"
      },
      {
        "Raw Material": "Rock salt",
        "Category": "Mineral & Chemical",
        "Raw Value / lb (gp)": 0.03,
        "Refining Cost / lb (gp)": 0.02,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Food/industrial salt"
      },
      {
        "Raw Material": "Saltpeter",
        "Category": "Mineral & Chemical",
        "Raw Value / lb (gp)": 0.2,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.7,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Purified saltpeter"
      },
      {
        "Raw Material": "Borax",
        "Category": "Mineral & Chemical",
        "Raw Value / lb (gp)": 0.15,
        "Refining Cost / lb (gp)": 0.08,
        "Weight Yield": 0.75,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Purified flux"
      },
      {
        "Raw Material": "Gypsum",
        "Category": "Mineral & Chemical",
        "Raw Value / lb (gp)": 0.02,
        "Refining Cost / lb (gp)": 0.03,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Plaster"
      },
      {
        "Raw Material": "Coal",
        "Category": "Fuel",
        "Raw Value / lb (gp)": 0.02,
        "Refining Cost / lb (gp)": 0.01,
        "Weight Yield": 0.9,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Sorted coal"
      },
      {
        "Raw Material": "Peat",
        "Category": "Fuel",
        "Raw Value / lb (gp)": 0.005,
        "Refining Cost / lb (gp)": 0.005,
        "Weight Yield": 0.6,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Dried peat"
      },
      {
        "Raw Material": "Crude bitumen",
        "Category": "Fuel",
        "Raw Value / lb (gp)": 0.05,
        "Refining Cost / lb (gp)": 0.04,
        "Weight Yield": 0.8,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Pitch / tar"
      },
      {
        "Raw Material": "Pine log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.01,
        "Refining Cost / lb (gp)": 0.02,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned pine lumber"
      },
      {
        "Raw Material": "Spruce log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.01,
        "Refining Cost / lb (gp)": 0.02,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned spruce lumber"
      },
      {
        "Raw Material": "Fir log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.012,
        "Refining Cost / lb (gp)": 0.02,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned fir lumber"
      },
      {
        "Raw Material": "Birch log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.015,
        "Refining Cost / lb (gp)": 0.025,
        "Weight Yield": 0.68,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned birch lumber"
      },
      {
        "Raw Material": "Oak log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.02,
        "Refining Cost / lb (gp)": 0.03,
        "Weight Yield": 0.65,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned oak lumber"
      },
      {
        "Raw Material": "Ash log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.025,
        "Refining Cost / lb (gp)": 0.035,
        "Weight Yield": 0.65,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned ash lumber"
      },
      {
        "Raw Material": "Maple log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.025,
        "Refining Cost / lb (gp)": 0.04,
        "Weight Yield": 0.65,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned maple lumber"
      },
      {
        "Raw Material": "Beech log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.02,
        "Refining Cost / lb (gp)": 0.03,
        "Weight Yield": 0.65,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Seasoned beech lumber"
      },
      {
        "Raw Material": "Cedar log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.04,
        "Refining Cost / lb (gp)": 0.04,
        "Weight Yield": 0.65,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Seasoned cedar"
      },
      {
        "Raw Material": "Walnut log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.05,
        "Refining Cost / lb (gp)": 0.06,
        "Weight Yield": 0.6,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Seasoned walnut"
      },
      {
        "Raw Material": "Yew log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.08,
        "Refining Cost / lb (gp)": 0.08,
        "Weight Yield": 0.55,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Seasoned yew"
      },
      {
        "Raw Material": "Mahogany log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.15,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.6,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Seasoned mahogany"
      },
      {
        "Raw Material": "Ebony log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 0.5,
        "Refining Cost / lb (gp)": 0.25,
        "Weight Yield": 0.55,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Seasoned ebony"
      },
      {
        "Raw Material": "Ironwood log",
        "Category": "Wood",
        "Raw Value / lb (gp)": 2,
        "Refining Cost / lb (gp)": 1,
        "Weight Yield": 0.5,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Worked ironwood"
      },
      {
        "Raw Material": "Bamboo",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.01,
        "Refining Cost / lb (gp)": 0.01,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Dried bamboo"
      },
      {
        "Raw Material": "Reeds",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.005,
        "Refining Cost / lb (gp)": 0.005,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Dried reeds"
      },
      {
        "Raw Material": "Flax stalks",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.03,
        "Refining Cost / lb (gp)": 0.08,
        "Weight Yield": 0.25,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Linen fiber"
      },
      {
        "Raw Material": "Hemp stalks",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.02,
        "Refining Cost / lb (gp)": 0.05,
        "Weight Yield": 0.3,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Hemp fiber"
      },
      {
        "Raw Material": "Cotton bolls",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.05,
        "Refining Cost / lb (gp)": 0.08,
        "Weight Yield": 0.35,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Clean cotton fiber"
      },
      {
        "Raw Material": "Raw wool",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.08,
        "Refining Cost / lb (gp)": 0.06,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Clean/card wool"
      },
      {
        "Raw Material": "Raw silk cocoons",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 1,
        "Refining Cost / lb (gp)": 1.5,
        "Weight Yield": 0.2,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Silk fiber"
      },
      {
        "Raw Material": "Natural rubber latex",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.1,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.6,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Rubber"
      },
      {
        "Raw Material": "Tree resin",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.08,
        "Refining Cost / lb (gp)": 0.05,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Rosin / resin"
      },
      {
        "Raw Material": "Beeswax comb",
        "Category": "Plant & Fiber",
        "Raw Value / lb (gp)": 0.15,
        "Refining Cost / lb (gp)": 0.08,
        "Weight Yield": 0.6,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Clean beeswax"
      },
      {
        "Raw Material": "Iron ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.05,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.45,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Iron"
      },
      {
        "Raw Material": "Bog iron ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.04,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.35,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Iron"
      },
      {
        "Raw Material": "Copper ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.1,
        "Refining Cost / lb (gp)": 0.15,
        "Weight Yield": 0.3,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Copper"
      },
      {
        "Raw Material": "Tin ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.25,
        "Refining Cost / lb (gp)": 0.25,
        "Weight Yield": 0.2,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Tin"
      },
      {
        "Raw Material": "Lead ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.08,
        "Refining Cost / lb (gp)": 0.12,
        "Weight Yield": 0.5,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Lead"
      },
      {
        "Raw Material": "Zinc ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.12,
        "Refining Cost / lb (gp)": 0.18,
        "Weight Yield": 0.3,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Zinc"
      },
      {
        "Raw Material": "Nickel ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.25,
        "Refining Cost / lb (gp)": 0.3,
        "Weight Yield": 0.2,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Nickel"
      },
      {
        "Raw Material": "Cobalt ore",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 0.5,
        "Refining Cost / lb (gp)": 0.5,
        "Weight Yield": 0.15,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Cobalt"
      },
      {
        "Raw Material": "Mercury ore (cinnabar)",
        "Category": "Metal Ore",
        "Raw Value / lb (gp)": 1,
        "Refining Cost / lb (gp)": 1,
        "Weight Yield": 0.15,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Mercury"
      },
      {
        "Raw Material": "Silver ore",
        "Category": "Precious Ore",
        "Raw Value / lb (gp)": 2,
        "Refining Cost / lb (gp)": 1.5,
        "Weight Yield": 0.1,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Silver"
      },
      {
        "Raw Material": "Electrum-bearing ore",
        "Category": "Precious Ore",
        "Raw Value / lb (gp)": 3,
        "Refining Cost / lb (gp)": 2,
        "Weight Yield": 0.08,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Electrum metals"
      },
      {
        "Raw Material": "Gold ore",
        "Category": "Precious Ore",
        "Raw Value / lb (gp)": 5,
        "Refining Cost / lb (gp)": 2,
        "Weight Yield": 0.05,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Gold"
      },
      {
        "Raw Material": "Platinum ore",
        "Category": "Precious Ore",
        "Raw Value / lb (gp)": 25,
        "Refining Cost / lb (gp)": 10,
        "Weight Yield": 0.03,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Platinum"
      },
      {
        "Raw Material": "Mithral ore",
        "Category": "Fantasy Ore",
        "Raw Value / lb (gp)": 50,
        "Refining Cost / lb (gp)": 25,
        "Weight Yield": 0.2,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Mithral"
      },
      {
        "Raw Material": "Adamantine ore",
        "Category": "Fantasy Ore",
        "Raw Value / lb (gp)": 100,
        "Refining Cost / lb (gp)": 50,
        "Weight Yield": 0.15,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Adamantine"
      },
      {
        "Raw Material": "Cold iron ore",
        "Category": "Fantasy Ore",
        "Raw Value / lb (gp)": 5,
        "Refining Cost / lb (gp)": 3,
        "Weight Yield": 0.35,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Cold iron"
      },
      {
        "Raw Material": "Star metal ore",
        "Category": "Fantasy Ore",
        "Raw Value / lb (gp)": 250,
        "Refining Cost / lb (gp)": 150,
        "Weight Yield": 0.1,
        "Rarity": "Legendary",
        "Typical Refined Product / Notes": "Star metal; specialist furnace required"
      },
      {
        "Raw Material": "Warpstone shard",
        "Category": "Fantasy Mineral",
        "Raw Value / lb (gp)": 500,
        "Refining Cost / lb (gp)": 250,
        "Weight Yield": 0.7,
        "Rarity": "Legendary",
        "Typical Refined Product / Notes": "Refined warpstone; extremely hazardous"
      },
      {
        "Raw Material": "Raw arcane crystal",
        "Category": "Fantasy Mineral",
        "Raw Value / lb (gp)": 50,
        "Refining Cost / lb (gp)": 20,
        "Weight Yield": 0.65,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Arcane crystal"
      },
      {
        "Raw Material": "Mana crystal",
        "Category": "Fantasy Mineral",
        "Raw Value / lb (gp)": 100,
        "Refining Cost / lb (gp)": 40,
        "Weight Yield": 0.7,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Charged magical crystal"
      },
      {
        "Raw Material": "Elemental crystal",
        "Category": "Fantasy Mineral",
        "Raw Value / lb (gp)": 75,
        "Refining Cost / lb (gp)": 30,
        "Weight Yield": 0.6,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Elemental essence crystal"
      },
      {
        "Raw Material": "Raw quartz",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 0.1,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.6,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Cut/polished quartz"
      },
      {
        "Raw Material": "Raw amethyst",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 2,
        "Refining Cost / lb (gp)": 1,
        "Weight Yield": 0.35,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Cut amethyst"
      },
      {
        "Raw Material": "Raw agate",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 1,
        "Refining Cost / lb (gp)": 0.5,
        "Weight Yield": 0.5,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Polished agate"
      },
      {
        "Raw Material": "Raw amber",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 2,
        "Refining Cost / lb (gp)": 0.75,
        "Weight Yield": 0.6,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Polished amber"
      },
      {
        "Raw Material": "Raw turquoise",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 3,
        "Refining Cost / lb (gp)": 1.5,
        "Weight Yield": 0.4,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Cut turquoise"
      },
      {
        "Raw Material": "Raw jade",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 5,
        "Refining Cost / lb (gp)": 2,
        "Weight Yield": 0.45,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Carved jade"
      },
      {
        "Raw Material": "Raw garnet",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 5,
        "Refining Cost / lb (gp)": 2,
        "Weight Yield": 0.3,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Cut garnet"
      },
      {
        "Raw Material": "Raw aquamarine",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 8,
        "Refining Cost / lb (gp)": 3,
        "Weight Yield": 0.25,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Cut aquamarine"
      },
      {
        "Raw Material": "Raw opal",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 10,
        "Refining Cost / lb (gp)": 4,
        "Weight Yield": 0.25,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Cut opal"
      },
      {
        "Raw Material": "Raw topaz",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 12,
        "Refining Cost / lb (gp)": 5,
        "Weight Yield": 0.2,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Cut topaz"
      },
      {
        "Raw Material": "Raw emerald",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 25,
        "Refining Cost / lb (gp)": 10,
        "Weight Yield": 0.15,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Cut emerald"
      },
      {
        "Raw Material": "Raw sapphire",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 30,
        "Refining Cost / lb (gp)": 12,
        "Weight Yield": 0.15,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Cut sapphire"
      },
      {
        "Raw Material": "Raw ruby",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 35,
        "Refining Cost / lb (gp)": 15,
        "Weight Yield": 0.15,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Cut ruby"
      },
      {
        "Raw Material": "Raw diamond",
        "Category": "Gem & Crystal",
        "Raw Value / lb (gp)": 50,
        "Refining Cost / lb (gp)": 20,
        "Weight Yield": 0.2,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Cut diamond"
      },
      {
        "Raw Material": "Raw animal hide",
        "Category": "Animal",
        "Raw Value / lb (gp)": 0.1,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.6,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Leather; species modifies value"
      },
      {
        "Raw Material": "Raw fur pelt",
        "Category": "Animal",
        "Raw Value / lb (gp)": 0.2,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.7,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Cured fur"
      },
      {
        "Raw Material": "Bone",
        "Category": "Animal",
        "Raw Value / lb (gp)": 0.03,
        "Refining Cost / lb (gp)": 0.03,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Clean/dried bone"
      },
      {
        "Raw Material": "Antler",
        "Category": "Animal",
        "Raw Value / lb (gp)": 0.15,
        "Refining Cost / lb (gp)": 0.08,
        "Weight Yield": 0.85,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Worked antler"
      },
      {
        "Raw Material": "Horn",
        "Category": "Animal",
        "Raw Value / lb (gp)": 0.2,
        "Refining Cost / lb (gp)": 0.1,
        "Weight Yield": 0.8,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Worked horn"
      },
      {
        "Raw Material": "Tusk / common ivory",
        "Category": "Animal",
        "Raw Value / lb (gp)": 1,
        "Refining Cost / lb (gp)": 0.5,
        "Weight Yield": 0.85,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Worked ivory"
      },
      {
        "Raw Material": "Shell",
        "Category": "Animal",
        "Raw Value / lb (gp)": 0.1,
        "Refining Cost / lb (gp)": 0.08,
        "Weight Yield": 0.75,
        "Rarity": "Common",
        "Typical Refined Product / Notes": "Worked shell"
      },
      {
        "Raw Material": "Chitin",
        "Category": "Animal",
        "Raw Value / lb (gp)": 0.15,
        "Refining Cost / lb (gp)": 0.15,
        "Weight Yield": 0.6,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Hardened chitin"
      },
      {
        "Raw Material": "Giant insect chitin",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 1,
        "Refining Cost / lb (gp)": 0.75,
        "Weight Yield": 0.55,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Armor-grade chitin"
      },
      {
        "Raw Material": "Giant spider silk gland",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 2,
        "Refining Cost / lb (gp)": 1,
        "Weight Yield": 0.25,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Spider silk"
      },
      {
        "Raw Material": "Dragon hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 50,
        "Refining Cost / lb (gp)": 25,
        "Weight Yield": 0.5,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Dragon leather"
      },
      {
        "Raw Material": "Dragon scales",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 100,
        "Refining Cost / lb (gp)": 50,
        "Weight Yield": 0.8,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Worked dragon scales"
      },
      {
        "Raw Material": "Dragon bone",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 40,
        "Refining Cost / lb (gp)": 20,
        "Weight Yield": 0.75,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Worked dragonbone"
      },
      {
        "Raw Material": "Dragon tooth",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 75,
        "Refining Cost / lb (gp)": 15,
        "Weight Yield": 0.9,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Worked dragon tooth"
      },
      {
        "Raw Material": "Troll hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 5,
        "Refining Cost / lb (gp)": 4,
        "Weight Yield": 0.45,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Regenerative leather"
      },
      {
        "Raw Material": "Basilisk hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 10,
        "Refining Cost / lb (gp)": 6,
        "Weight Yield": 0.5,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Hardened basilisk leather"
      },
      {
        "Raw Material": "Bulette shell",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 15,
        "Refining Cost / lb (gp)": 8,
        "Weight Yield": 0.65,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Armor-grade shell"
      },
      {
        "Raw Material": "Ankheg chitin",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 5,
        "Refining Cost / lb (gp)": 3,
        "Weight Yield": 0.6,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Acid-resistant chitin"
      },
      {
        "Raw Material": "Wyvern hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 12,
        "Refining Cost / lb (gp)": 7,
        "Weight Yield": 0.55,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Wyvern leather"
      },
      {
        "Raw Material": "Griffon hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 8,
        "Refining Cost / lb (gp)": 5,
        "Weight Yield": 0.55,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Griffon leather"
      },
      {
        "Raw Material": "Manticore hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 8,
        "Refining Cost / lb (gp)": 5,
        "Weight Yield": 0.55,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Manticore leather"
      },
      {
        "Raw Material": "Displacer beast hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 25,
        "Refining Cost / lb (gp)": 15,
        "Weight Yield": 0.45,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Displacement-sensitive hide"
      },
      {
        "Raw Material": "Phase spider chitin",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 20,
        "Refining Cost / lb (gp)": 12,
        "Weight Yield": 0.5,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Planar chitin"
      },
      {
        "Raw Material": "Vampire beast hide",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 15,
        "Refining Cost / lb (gp)": 10,
        "Weight Yield": 0.4,
        "Rarity": "Rare",
        "Typical Refined Product / Notes": "Necrotically tainted leather"
      },
      {
        "Raw Material": "Undead bone",
        "Category": "Monster Material",
        "Raw Value / lb (gp)": 0.5,
        "Refining Cost / lb (gp)": 0.5,
        "Weight Yield": 0.75,
        "Rarity": "Uncommon",
        "Typical Refined Product / Notes": "Stabilized necrotic bone"
      },
      {
        "Raw Material": "Fiend hide",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 25,
        "Refining Cost / lb (gp)": 15,
        "Weight Yield": 0.5,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Infernal leather"
      },
      {
        "Raw Material": "Fiend horn",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 30,
        "Refining Cost / lb (gp)": 10,
        "Weight Yield": 0.8,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Infernal horn"
      },
      {
        "Raw Material": "Demon ichor",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 50,
        "Refining Cost / lb (gp)": 25,
        "Weight Yield": 0.6,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Stabilized demonic reagent"
      },
      {
        "Raw Material": "Devil ichor",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 60,
        "Refining Cost / lb (gp)": 30,
        "Weight Yield": 0.65,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Stabilized infernal reagent"
      },
      {
        "Raw Material": "Celestial feather",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 100,
        "Refining Cost / lb (gp)": 20,
        "Weight Yield": 0.9,
        "Rarity": "Legendary",
        "Typical Refined Product / Notes": "Consecrated feather"
      },
      {
        "Raw Material": "Celestial bone",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 150,
        "Refining Cost / lb (gp)": 50,
        "Weight Yield": 0.8,
        "Rarity": "Legendary",
        "Typical Refined Product / Notes": "Consecrated bone"
      },
      {
        "Raw Material": "Feywood",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 20,
        "Refining Cost / lb (gp)": 10,
        "Weight Yield": 0.6,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Seasoned feywood"
      },
      {
        "Raw Material": "Fey crystal",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 40,
        "Refining Cost / lb (gp)": 15,
        "Weight Yield": 0.7,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Refined fey crystal"
      },
      {
        "Raw Material": "Elemental earth core",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 30,
        "Refining Cost / lb (gp)": 15,
        "Weight Yield": 0.7,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Earth essence"
      },
      {
        "Raw Material": "Elemental fire core",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 40,
        "Refining Cost / lb (gp)": 20,
        "Weight Yield": 0.6,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Fire essence"
      },
      {
        "Raw Material": "Elemental water core",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 30,
        "Refining Cost / lb (gp)": 15,
        "Weight Yield": 0.7,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Water essence"
      },
      {
        "Raw Material": "Elemental air core",
        "Category": "Planar Material",
        "Raw Value / lb (gp)": 40,
        "Refining Cost / lb (gp)": 20,
        "Weight Yield": 0.5,
        "Rarity": "Very Rare",
        "Typical Refined Product / Notes": "Air essence"
      }
    ]
  },
  {
    "key": "rarityRules",
    "label": "Рядкост (правила)",
    "group": "Икономика",
    "type": "table",
    "nameCol": "Rarity",
    "badgeCol": null,
    "filterable": false,
    "columns": [
      "Rarity",
      "General Meaning",
      "Typical Availability",
      "Notes"
    ],
    "rows": [
      {
        "Rarity": "Common",
        "General Meaning": "Routine material",
        "Typical Availability": "Most settlements/regions",
        "Notes": "Usually available locally if geography permits"
      },
      {
        "Rarity": "Uncommon",
        "General Meaning": "Requires suitable region or trade",
        "Typical Availability": "Specialists / regional markets",
        "Notes": "May require travel or bulk order"
      },
      {
        "Rarity": "Rare",
        "General Meaning": "Difficult to source",
        "Typical Availability": "Major markets / dangerous locations",
        "Notes": "Often guarded, monopolized, or imported"
      },
      {
        "Rarity": "Very Rare",
        "General Meaning": "Exceptional resource",
        "Typical Availability": "Special expeditions / elite traders",
        "Notes": "Usually tied to monsters, magic, or remote deposits"
      },
      {
        "Rarity": "Legendary",
        "General Meaning": "Campaign-level resource",
        "Typical Availability": "Unique locations / major events",
        "Notes": "Not normally available for ordinary purchase"
      },
      {
        "Rarity": "Rule",
        "General Meaning": "Raw value is per 1 lb",
        "Typical Availability": "Refining cost is per 1 lb of raw input",
        "Notes": "Yield is the percentage of raw input mass that becomes usable refined material"
      }
    ]
  }
];
