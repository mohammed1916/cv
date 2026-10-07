// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "An odd square counts the center once",
    "input": "{\"mat\":[[2,7,4,8,3],[6,9,1,5,7],[4,2,11,6,8],[9,3,7,12,1],[5,8,2,4,10]]}"
  },
  {
    "label": "One cell",
    "input": "{\"mat\":[[17]]}"
  },
  {
    "label": "Even square has no shared center",
    "input": "{\"mat\":[[3,7],[5,9]]}"
  },
  {
    "label": "Off-diagonal values do not contribute",
    "input": "{\"mat\":[[1,8,2],[7,3,9],[4,6,5]]}"
  }
];
