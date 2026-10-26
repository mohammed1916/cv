// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rows and columns prefer different flips",
    "input": "{\"grid\":[[0,1,0,1,1],[1,0,1,0,0],[0,0,1,1,0],[1,1,0,0,1]]}"
  },
  {
    "label": "Single zero bit",
    "input": "{\"grid\":[[0]]}"
  },
  {
    "label": "Already maximal",
    "input": "{\"grid\":[[1,1,1],[1,1,1]]}"
  },
  {
    "label": "Column tie needs no flip",
    "input": "{\"grid\":[[1,0],[1,1]]}"
  }
];
