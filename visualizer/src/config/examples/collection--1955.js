// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved phases create many valid choices",
    "input": "{\"nums\":[0,0,1,0,1,2,1,2,0,1,2,2]}"
  },
  {
    "label": "Missing middle phase",
    "input": "{\"nums\":[0,0,2,2]}"
  },
  {
    "label": "Reverse order prevents a complete subsequence",
    "input": "{\"nums\":[2,2,1,1,0,0]}"
  },
  {
    "label": "Long runs multiply independent choices",
    "input": "{\"nums\":[0,0,0,1,1,1,2,2,2]}"
  }
];
