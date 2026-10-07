// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Separate enclosed and boundary-connected land components",
    "input": "{\"grid\":[[1,1,1,1,1,1],[1,0,0,1,0,1],[1,0,1,1,0,1],[1,1,1,0,1,1],[0,1,1,0,1,1]]}"
  },
  {
    "label": "All water",
    "input": "{\"grid\":[[1,1],[1,1]]}"
  },
  {
    "label": "All land touches the boundary",
    "input": "{\"grid\":[[0,0,0],[0,0,0],[0,0,0]]}"
  },
  {
    "label": "One enclosed cell",
    "input": "{\"grid\":[[1,1,1],[1,0,1],[1,1,1]]}"
  }
];
