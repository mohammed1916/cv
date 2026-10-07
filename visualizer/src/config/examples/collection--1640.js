// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Whole chunks arrive in a shuffled order",
    "input": "{\"arr\":[14,8,21,5,17,3,26,9],\"pieces\":[[17,3],[26,9],[14,8,21],[5]]}"
  },
  {
    "label": "Internal piece order cannot change",
    "input": "{\"arr\":[7,2,9],\"pieces\":[[2,7],[9]]}"
  },
  {
    "label": "Missing target value",
    "input": "{\"arr\":[4,8,12],\"pieces\":[[4],[8],[13]]}"
  },
  {
    "label": "One whole matching piece",
    "input": "{\"arr\":[3,11,6],\"pieces\":[[3,11,6]]}"
  }
];
