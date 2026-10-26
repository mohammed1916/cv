// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Many mismatches compete between alternating targets",
    "input": "{\"s\":\"110001011100\"}"
  },
  {
    "label": "Count imbalance makes alternation impossible",
    "input": "{\"s\":\"111110\"}"
  },
  {
    "label": "Already alternating",
    "input": "{\"s\":\"0101010\"}"
  },
  {
    "label": "Odd length fixes the starting bit",
    "input": "{\"s\":\"00101\"}"
  }
];
