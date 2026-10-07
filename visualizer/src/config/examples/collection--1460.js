// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The same repeated values appear in different orders",
    "input": "{\"target\":[8,3,5,8,2,7,3,9],\"arr\":[3,9,8,7,3,2,8,5]}"
  },
  {
    "label": "One differing multiplicity prevents equality",
    "input": "{\"target\":[4,4,6],\"arr\":[4,6,6]}"
  },
  {
    "label": "Already equal arrays",
    "input": "{\"target\":[2,5,7],\"arr\":[2,5,7]}"
  },
  {
    "label": "One value each",
    "input": "{\"target\":[11],\"arr\":[11]}"
  }
];
