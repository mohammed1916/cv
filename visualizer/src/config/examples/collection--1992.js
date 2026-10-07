// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several separated rectangles have different shapes",
    "input": "{\"land\":[[1,1,0,0,1,1,1],[1,1,0,0,1,1,1],[0,0,0,0,0,0,0],[0,1,1,1,0,1,0],[0,1,1,1,0,1,0]]}"
  },
  {
    "label": "An all-zero field has no groups",
    "input": "{\"land\":[[0,0,0],[0,0,0]]}"
  },
  {
    "label": "The entire field is one rectangle",
    "input": "{\"land\":[[1,1,1,1],[1,1,1,1]]}"
  },
  {
    "label": "Single cells can touch diagonally",
    "input": "{\"land\":[[1,0,1],[0,1,0],[1,0,1]]}"
  }
];
