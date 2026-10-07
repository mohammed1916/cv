// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several stars and single-character slots",
    "s": "silverriverbank",
    "p": "s*?r*bank"
  },
  {
    "label": "Star matches empty",
    "s": "cedar",
    "p": "ce*dar"
  },
  {
    "label": "Whole string mismatch",
    "s": "riverbank",
    "p": "river"
  },
  {
    "label": "Empty with stars",
    "s": "",
    "p": "***"
  },
  {
    "label": "Question needs a character",
    "s": "",
    "p": "?"
  }
];
