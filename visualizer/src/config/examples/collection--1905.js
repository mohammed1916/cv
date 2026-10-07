// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Some second-grid components extend beyond first-grid land",
    "input": "{\"grid1\":[[1,1,0,1,1],[1,1,0,1,0],[0,0,0,1,1],[1,1,0,0,1],[1,0,1,1,1]],\"grid2\":[[1,1,0,1,0],[1,0,0,1,1],[0,1,0,0,1],[1,1,0,0,0],[0,0,1,1,0]]}"
  },
  {
    "label": "No land in the second grid",
    "input": "{\"grid1\":[[1,1],[1,1]],\"grid2\":[[0,0],[0,0]]}"
  },
  {
    "label": "Every second island is covered",
    "input": "{\"grid1\":[[1,1,1],[1,1,1]],\"grid2\":[[1,0,1],[0,1,0]]}"
  },
  {
    "label": "One uncovered cell invalidates the whole component",
    "input": "{\"grid1\":[[1,1],[1,0]],\"grid2\":[[1,1],[1,1]]}"
  }
];
