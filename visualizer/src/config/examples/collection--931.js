// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Negative cells change the cheapest path",
    "input": "{\"matrix\":[[7,-3,8,4],[6,5,-9,2],[-4,7,3,-6],[9,-2,1,5]]}"
  },
  {
    "label": "Single cell",
    "input": "{\"matrix\":[[-8]]}"
  },
  {
    "label": "Equal costs",
    "input": "{\"matrix\":[[4,4],[4,4]]}"
  },
  {
    "label": "Boundary path wins",
    "input": "{\"matrix\":[[1,8,9],[2,7,8],[3,6,9]]}"
  }
];
