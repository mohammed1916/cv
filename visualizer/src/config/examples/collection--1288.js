// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested intervals and partially overlapping extensions",
    "input": "{\"intervals\":[[1,8],[2,5],[4,11],[4,7],[9,14],[10,12],[15,19]]}"
  },
  {
    "label": "Same start favors the longest interval",
    "input": "{\"intervals\":[[3,8],[3,12],[3,5]]}"
  },
  {
    "label": "Disjoint intervals all remain",
    "input": "{\"intervals\":[[1,3],[5,7],[9,11]]}"
  },
  {
    "label": "Same end leaves the earliest start",
    "input": "{\"intervals\":[[1,9],[3,9],[5,9]]}"
  }
];
