// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both turn directions compete across uneven fruit locations",
    "input": "{\"fruits\":[[1,5],[3,8],[6,3],[8,12],[11,6],[14,10],[18,7],[23,20]],\"startPos\":10,\"k\":13}"
  },
  {
    "label": "Zero steps can harvest only the starting location",
    "input": "{\"fruits\":[[2,4],[7,9],[12,6]],\"startPos\":7,\"k\":0}"
  },
  {
    "label": "All fruit lies on one side of the start",
    "input": "{\"fruits\":[[5,4],[9,8],[13,3],[20,11]],\"startPos\":1,\"k\":12}"
  },
  {
    "label": "Every location is outside the travel budget",
    "input": "{\"fruits\":[[2,7],[30,9]],\"startPos\":15,\"k\":4}"
  }
];
