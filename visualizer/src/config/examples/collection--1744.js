// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Consumption intervals overlap different candy types",
    "input": "{\"candiesCount\":[6,3,9,4,8],\"queries\":[[2,4,3],[0,8,2],[4,12,2],[3,2,4],[1,6,1]]}"
  },
  {
    "label": "First candy on day zero",
    "input": "{\"candiesCount\":[4,7],\"queries\":[[0,0,1],[1,0,4],[1,0,5]]}"
  },
  {
    "label": "Daily cap one fixes exact progress",
    "input": "{\"candiesCount\":[3,2],\"queries\":[[1,2,1],[1,3,1],[1,5,1]]}"
  },
  {
    "label": "Only one candy type",
    "input": "{\"candiesCount\":[8],\"queries\":[[0,7,1],[0,8,9]]}"
  }
];
