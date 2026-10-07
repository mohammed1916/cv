// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several demand plateaus compete for limited resizing",
    "input": "{\"nums\":[4,7,6,19,22,18,5,8,7],\"k\":2}"
  },
  {
    "label": "No resize means one maximum capacity",
    "input": "{\"nums\":[3,11,5,9,2],\"k\":0}"
  },
  {
    "label": "A resize between every pair eliminates waste",
    "input": "{\"nums\":[6,17,3,12],\"k\":3}"
  },
  {
    "label": "Constant demand needs no resizing",
    "input": "{\"nums\":[8,8,8,8,8],\"k\":2}"
  }
];
