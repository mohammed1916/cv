// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive values force repeated shrinking near the score limit",
    "input": "{\"nums\":[3,1,4,2,6,1,5,2,3],\"k\":35}"
  },
  {
    "label": "Equality with the threshold is excluded",
    "input": "{\"nums\":[4],\"k\":4}"
  },
  {
    "label": "A low threshold can reject every singleton",
    "input": "{\"nums\":[5,6,7],\"k\":2}"
  },
  {
    "label": "A large threshold admits every subarray",
    "input": "{\"nums\":[1,2,1,3],\"k\":100}"
  }
];
