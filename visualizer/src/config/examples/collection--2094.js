// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated digits and zeros offer many valid arrangements",
    "input": "{\"digits\":[7,0,4,4,2,9,0,6]}"
  },
  {
    "label": "Zero cannot lead but may occupy both other slots",
    "input": "{\"digits\":[0,0,8]}"
  },
  {
    "label": "Repeated positions require separate digit occurrences",
    "input": "{\"digits\":[6,6,6,6]}"
  },
  {
    "label": "All odd digits leave no even ending",
    "input": "{\"digits\":[1,3,5,7,9]}"
  }
];
