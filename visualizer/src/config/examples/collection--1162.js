// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several land sources send overlapping waves",
    "input": "{\"grid\":[[1,0,0,0,0],[0,0,0,1,0],[0,0,0,0,0],[0,1,0,0,0],[0,0,0,0,0]]}"
  },
  {
    "label": "All land",
    "input": "{\"grid\":[[1,1],[1,1]]}"
  },
  {
    "label": "All water",
    "input": "{\"grid\":[[0,0],[0,0]]}"
  },
  {
    "label": "One corner source",
    "input": "{\"grid\":[[1,0,0],[0,0,0],[0,0,0]]}"
  }
];
