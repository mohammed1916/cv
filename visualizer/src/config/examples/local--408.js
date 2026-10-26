// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several skip groups",
    "word": "characterization",
    "abbr": "c4c3i5n",
    "expected": true
  },
  {
    "label": "Leading zero is invalid",
    "word": "riverbank",
    "abbr": "r07k",
    "expected": false
  },
  {
    "label": "Skip whole word",
    "word": "lantern",
    "abbr": "7",
    "expected": true
  },
  {
    "label": "Skip beyond end",
    "word": "meadow",
    "abbr": "m9w",
    "expected": false
  },
  {
    "label": "No abbreviation",
    "word": "pine",
    "abbr": "pine",
    "expected": true
  }
];
