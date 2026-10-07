// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Restore candidates compete with the item exposed by removals",
    "input": "{\"nums\":[8,21,4,17,6,30,9,12],\"k\":5}"
  },
  {
    "label": "Zero moves preserves the original top",
    "input": "{\"nums\":[14,3,22],\"k\":0}"
  },
  {
    "label": "An odd number of moves empties a singleton stack",
    "input": "{\"nums\":[19],\"k\":7}"
  },
  {
    "label": "More moves than items can still restore the largest value",
    "input": "{\"nums\":[4,16,7],\"k\":8}"
  }
];
