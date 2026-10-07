// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A shift crosses row and whole-grid boundaries",
    "input": "{\"grid\":[[4,9,2,7],[6,1,8,3],[5,12,10,11]],\"k\":7}"
  },
  {
    "label": "Zero shift preserves positions",
    "input": "{\"grid\":[[3,8],[1,6]],\"k\":0}"
  },
  {
    "label": "Full rotations return the original grid",
    "input": "{\"grid\":[[2,4,6],[8,10,12]],\"k\":18}"
  },
  {
    "label": "Single-column wraparound",
    "input": "{\"grid\":[[5],[9],[2],[7]],\"k\":3}"
  }
];
