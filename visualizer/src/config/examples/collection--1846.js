// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Large values are lowered around repeated small entries",
    "input": "{\"arr\":[9,2,12,2,7,1,15,3,8,2]}"
  },
  {
    "label": "All large values form a full ladder",
    "input": "{\"arr\":[20,20,20,20]}"
  },
  {
    "label": "Already optimal",
    "input": "{\"arr\":[1,2,3,4,5]}"
  },
  {
    "label": "Repeated ones cannot increase",
    "input": "{\"arr\":[1,1,1,1]}"
  }
];
