// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Some negative dishes help by delaying stronger dishes",
    "input": "{\"satisfaction\":[-7,4,-2,8,1,-5,6,-1]}"
  },
  {
    "label": "All negative dishes should be skipped",
    "input": "{\"satisfaction\":[-9,-3,-6]}"
  },
  {
    "label": "All positive dishes can be included",
    "input": "{\"satisfaction\":[2,7,4,9]}"
  },
  {
    "label": "A zero-satisfaction dish can improve later timing",
    "input": "{\"satisfaction\":[0,0,5]}"
  }
];
