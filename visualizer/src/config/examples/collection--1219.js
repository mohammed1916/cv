// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Branching gold corridors require restoring visited cells",
    "input": "{\"grid\":[[0,6,0,0],[4,8,3,0],[0,5,0,7],[0,2,9,0]]}"
  },
  {
    "label": "No gold",
    "input": "{\"grid\":[[0,0],[0,0]]}"
  },
  {
    "label": "One isolated gold cell",
    "input": "{\"grid\":[[0,0,0],[0,17,0],[0,0,0]]}"
  },
  {
    "label": "A straight corridor can collect everything",
    "input": "{\"grid\":[[3,7,2,9,4]]}"
  }
];
