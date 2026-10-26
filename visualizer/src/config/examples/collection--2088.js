// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A large upright pyramid contains many smaller apices",
    "input": "{\"grid\":[[0,0,0,1,0,0,0],[0,0,1,1,1,0,0],[0,1,1,1,1,1,0],[1,1,1,1,1,1,1]]}"
  },
  {
    "label": "A fully fertile rectangle supports both orientations",
    "input": "{\"grid\":[[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]}"
  },
  {
    "label": "A single row has no height-two pyramid",
    "input": "{\"grid\":[[1,1,1,1,1]]}"
  },
  {
    "label": "No fertile cell means no pyramid",
    "input": "{\"grid\":[[0,0,0],[0,0,0]]}"
  }
];
