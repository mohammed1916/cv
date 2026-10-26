// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several intersections gradually remove candidate values",
    "input": "{\"arrays\":[[2,4,7,9,12,16,21],[1,4,7,12,18,21],[4,6,7,12,20,21],[3,4,7,10,12,21]]}"
  },
  {
    "label": "No value belongs to every row",
    "input": "{\"arrays\":[[1,4,8],[2,5,9]]}"
  },
  {
    "label": "Identical arrays retain every value",
    "input": "{\"arrays\":[[3,8,14],[3,8,14]]}"
  },
  {
    "label": "A single array is its own subsequence",
    "input": "{\"arrays\":[[5,11,19,23]]}"
  }
];
