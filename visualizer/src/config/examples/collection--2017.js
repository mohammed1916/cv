// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven row rewards change the best turn column",
    "input": "{\"grid\":[[7,2,11,4,9,3,8],[5,12,1,10,2,14,6]]}"
  },
  {
    "label": "One column leaves no unvisited points",
    "input": "{\"grid\":[[8],[13]]}"
  },
  {
    "label": "Large top suffix favors a later turn",
    "input": "{\"grid\":[[1,1,1,30],[2,2,2,2]]}"
  },
  {
    "label": "Equal rows create symmetric choices",
    "input": "{\"grid\":[[6,6,6,6],[6,6,6,6]]}"
  }
];
