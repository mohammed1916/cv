// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several paths hit walls or V-shaped traps",
    "input": "{\"grid\":[[1,1,1,-1,-1,-1],[1,1,1,1,-1,-1],[-1,-1,1,1,1,1],[1,1,-1,-1,-1,-1]]}"
  },
  {
    "label": "Every ball hits a wall in one column",
    "input": "{\"grid\":[[1],[-1],[1]]}"
  },
  {
    "label": "A V traps both balls",
    "input": "{\"grid\":[[1,-1]]}"
  },
  {
    "label": "Parallel slopes then return",
    "input": "{\"grid\":[[1,1,1,1],[-1,-1,-1,-1]]}"
  }
];
