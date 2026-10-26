// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Alternating contributions create several tied best splits",
    "input": "{\"nums\":[0,1,0,0,1,1,0,1,0,0,1,0]}"
  },
  {
    "label": "All zeros favor the empty right side",
    "input": "{\"nums\":[0,0,0,0,0]}"
  },
  {
    "label": "All ones favor the empty left side",
    "input": "{\"nums\":[1,1,1,1]}"
  },
  {
    "label": "One zero has a single best endpoint",
    "input": "{\"nums\":[0]}"
  }
];
