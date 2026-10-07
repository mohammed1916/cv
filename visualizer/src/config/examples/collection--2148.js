// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated interior values count as separate qualifying elements",
    "input": "{\"nums\":[-4,7,2,7,15,-4,9,3,15,6]}"
  },
  {
    "label": "Equal values have no strict witnesses",
    "input": "{\"nums\":[8,8,8,8]}"
  },
  {
    "label": "Two distinct extremes leave no interior value",
    "input": "{\"nums\":[3,12]}"
  },
  {
    "label": "Negative interior values qualify normally",
    "input": "{\"nums\":[-15,-9,-2,-7,-15,-2]}"
  }
];
