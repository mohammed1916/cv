// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Factors of two and five are spread across different rays",
    "input": "{\"grid\":[[4,25,6,10],[15,8,20,3],[2,50,12,5],[40,7,16,125]]}"
  },
  {
    "label": "A grid with no factor five has no trailing zero product",
    "input": "{\"grid\":[[2,4,8],[16,32,64]]}"
  },
  {
    "label": "One row is a degenerate cornered path",
    "input": "{\"grid\":[[5,4,25,8,10]]}"
  },
  {
    "label": "One cell contributes its own trailing zeros",
    "input": "{\"grid\":[[1000]]}"
  }
];
