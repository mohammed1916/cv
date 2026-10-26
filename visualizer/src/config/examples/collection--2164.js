// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The two index groups sort in opposite directions",
    "input": "{\"nums\":[14,3,8,19,2,11,17,5,6]}"
  },
  {
    "label": "One value has no odd-index group",
    "input": "{\"nums\":[7]}"
  },
  {
    "label": "Duplicates remain in their original parity group",
    "input": "{\"nums\":[4,9,4,9,2,7]}"
  },
  {
    "label": "Already ordered parity groups remain unchanged",
    "input": "{\"nums\":[1,12,3,9,5,6]}"
  }
];
