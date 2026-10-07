// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Trim two entries from each tail of forty values",
    "input": "{\"arr\":[82,14,53,7,91,26,48,63,35,19,74,42,58,11,96,31,67,24,89,46,5,77,39,62,17,84,28,51,72,44,99,22,56,68,13,94,33,61,8,49]}"
  },
  {
    "label": "Equal values survive positional trimming",
    "input": "{\"arr\":[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]}"
  },
  {
    "label": "Two outliers are removed",
    "input": "{\"arr\":[0,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,900]}"
  },
  {
    "label": "Ordered twenty-entry sequence",
    "input": "{\"arr\":[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40]}"
  }
];
