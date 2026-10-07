// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Some quadrants are uniform while others require another split",
    "input": "{\"grid\":[[1,1,0,0],[1,1,0,1],[0,0,1,1],[0,0,1,1]]}"
  },
  {
    "label": "A uniform square compresses to one leaf",
    "input": "{\"grid\":[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]}"
  },
  {
    "label": "A checkerboard reaches one-cell leaves",
    "input": "{\"grid\":[[1,0,1,0],[0,1,0,1],[1,0,1,0],[0,1,0,1]]}"
  },
  {
    "label": "One cell is already a leaf",
    "input": "{\"grid\":[[1]]}"
  }
];
