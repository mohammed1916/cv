// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Runs of equal values force deletions inside unfinished pairs",
    "input": "{\"nums\":[3,3,3,8,8,2,2,2,7,7,4,4,9]}"
  },
  {
    "label": "An already beautiful even array needs no deletion",
    "input": "{\"nums\":[1,4,4,7,7,2]}"
  },
  {
    "label": "All equal values eventually leave no complete pair",
    "input": "{\"nums\":[6,6,6,6,6]}"
  },
  {
    "label": "One trailing unmatched value must be removed",
    "input": "{\"nums\":[2,5,8]}"
  }
];
