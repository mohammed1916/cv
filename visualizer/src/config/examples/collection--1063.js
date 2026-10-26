// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Smaller values close several pending start ranges",
    "input": "{\"nums\":[3,6,4,7,2,5,5,1]}"
  },
  {
    "label": "Equal values never violate the first-value condition",
    "input": "{\"nums\":[8,8,8,8]}"
  },
  {
    "label": "A decreasing array permits only singleton ranges",
    "input": "{\"nums\":[9,7,5,3]}"
  },
  {
    "label": "An increasing array permits every subarray",
    "input": "{\"nums\":[1,4,6,10]}"
  }
];
