// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Calls on both sides of the inclusive time boundary",
    "input": "{\"times\":[100,850,1600,3100,3101,4200,6100,7200]}"
  },
  {
    "label": "Exact boundary stays",
    "input": "{\"times\":[5,3005]}"
  },
  {
    "label": "Large gaps remove every prior call",
    "input": "{\"times\":[1,4002,8003]}"
  },
  {
    "label": "One call",
    "input": "{\"times\":[19]}"
  }
];
