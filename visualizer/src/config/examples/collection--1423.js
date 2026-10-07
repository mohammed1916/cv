// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The best selection combines both ends",
    "input": "{\"cardPoints\":[9,2,7,3,1,8,4,6,11,5],\"k\":5}"
  },
  {
    "label": "Take all cards",
    "input": "{\"cardPoints\":[4,7,2,9],\"k\":4}"
  },
  {
    "label": "Take one strongest endpoint",
    "input": "{\"cardPoints\":[8,30,4,7],\"k\":1}"
  },
  {
    "label": "Equal card values make all choices tie",
    "input": "{\"cardPoints\":[6,6,6,6,6],\"k\":3}"
  }
];
