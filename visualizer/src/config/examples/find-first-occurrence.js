// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated prefixes before match",
    "haystack": "abacababacabadabacaba",
    "needle": "abacabad"
  },
  {
    "label": "Absent pattern",
    "haystack": "copperpaperproper",
    "needle": "pepper"
  },
  {
    "label": "Whole text",
    "haystack": "riverbank",
    "needle": "riverbank"
  },
  {
    "label": "Suffix match",
    "haystack": "silverriver",
    "needle": "river"
  },
  {
    "label": "Needle longer",
    "haystack": "oak",
    "needle": "oakwood"
  }
];
