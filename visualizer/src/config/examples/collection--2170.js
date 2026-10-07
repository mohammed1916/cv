// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Conflicting parity favorites require a second-choice value",
    "input": "{\"nums\":[4,4,4,4,7,4,4,8,7,8,4,4]}"
  },
  {
    "label": "An alternating array already satisfies both rules",
    "input": "{\"nums\":[3,9,3,9,3,9]}"
  },
  {
    "label": "All equal values force one parity group to change",
    "input": "{\"nums\":[6,6,6,6,6]}"
  },
  {
    "label": "A singleton needs no change",
    "input": "{\"nums\":[12]}"
  }
];
