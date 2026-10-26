// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A small board permits competing covering paths around an obstacle",
    "input": "{\"grid\":[[1,0,0,0],[0,-1,0,0],[0,0,0,2]]}"
  },
  {
    "label": "An unobstructed corridor has one covering path",
    "input": "{\"grid\":[[1,0,0,0,2]]}"
  },
  {
    "label": "Reaching the end early leaves an unvisited branch",
    "input": "{\"grid\":[[1,2,0],[0,-1,0]]}"
  },
  {
    "label": "An obstacle can disconnect the required cells",
    "input": "{\"grid\":[[1,-1,2],[0,-1,0]]}"
  }
];
