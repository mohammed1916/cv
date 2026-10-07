// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several minima own overlapping ranges with distinct boundaries",
    "input": "{\"arr\":[8,3,6,2,5,5,1,7]}"
  },
  {
    "label": "Equal minima require one consistent tie owner",
    "input": "{\"arr\":[4,4,4,4]}"
  },
  {
    "label": "Increasing values wait for the final stack flush",
    "input": "{\"arr\":[1,3,5,7,9]}"
  },
  {
    "label": "One value contributes exactly itself",
    "input": "{\"arr\":[12]}"
  }
];
