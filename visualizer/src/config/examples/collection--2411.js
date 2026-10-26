// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Future bit positions force windows of different lengths",
    "input": "{\"nums\":[1,4,0,2,8,3,0,12,1]}"
  },
  {
    "label": "All zeros need only their singleton windows",
    "input": "{\"nums\":[0,0,0,0]}"
  },
  {
    "label": "Identical masks already attain every suffix OR",
    "input": "{\"nums\":[11,11,11]}"
  },
  {
    "label": "A unique far-right bit forces earlier windows to reach it",
    "input": "{\"nums\":[1,1,1,16]}"
  }
];
