// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two synchronized routes share some cherries and avoid blocked cells",
    "input": "{\"grid\":[[0,1,0,1],[1,0,-1,1],[1,1,1,0],[0,-1,1,1]]}"
  },
  {
    "label": "A blocked corridor makes a round trip impossible",
    "input": "{\"grid\":[[0,1,-1],[-1,-1,1],[1,1,1]]}"
  },
  {
    "label": "One cherry cell is counted once for both walkers",
    "input": "{\"grid\":[[1]]}"
  },
  {
    "label": "A cherry-filled square rewards two boundary routes",
    "input": "{\"grid\":[[1,1,1],[1,1,1],[1,1,1]]}"
  }
];
