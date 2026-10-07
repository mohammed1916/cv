// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Short-lived batches compete with long-lived reserves",
    "input": "{\"apples\":[3,1,4,0,2,5,1,0,3],\"days\":[4,1,2,0,5,2,1,0,4]}"
  },
  {
    "label": "No production",
    "input": "{\"apples\":[0,0,0],\"days\":[0,0,0]}"
  },
  {
    "label": "All apples expire next day",
    "input": "{\"apples\":[5,4,3],\"days\":[1,1,1]}"
  },
  {
    "label": "Continue eating after production ends",
    "input": "{\"apples\":[7],\"days\":[10]}"
  }
];
