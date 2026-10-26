// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A late outlier interrupts a long increasing prefix",
    "input": "{\"nums\":[2,5,8,11,29,14,17,20,23]}"
  },
  {
    "label": "Remove the current value rather than its predecessor",
    "input": "{\"nums\":[2,7,1,9,12]}"
  },
  {
    "label": "Two conflicts exhaust the budget",
    "input": "{\"nums\":[4,3,2,8,9]}"
  },
  {
    "label": "Two equal entries become a singleton",
    "input": "{\"nums\":[6,6]}"
  }
];
