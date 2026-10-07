// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Marginal gains change after each assignment",
    "input": "{\"classes\":[[2,7],[5,9],[3,4],[6,12],[1,5]],\"extraStudents\":12}"
  },
  {
    "label": "All classes already perfect",
    "input": "{\"classes\":[[3,3],[7,7]],\"extraStudents\":5}"
  },
  {
    "label": "Single class receives every extra student",
    "input": "{\"classes\":[[2,8]],\"extraStudents\":6}"
  },
  {
    "label": "Equal starting ratios have different gains",
    "input": "{\"classes\":[[1,2],[3,6],[5,10]],\"extraStudents\":4}"
  }
];
