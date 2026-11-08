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
  },
  {
    "label": "Single water cell",
    "input": "[[0]]"
  },
  {
    "label": "One land cell",
    "input": "[[1]]"
  },
  {
    "label": "Checkerboard five by five",
    "input": "[[1,0,1,0,1],[0,1,0,1,0],[1,0,1,0,1],[0,1,0,1,0],[1,0,1,0,1]]"
  },
  {
    "label": "Long run: 12 by 12 grid",
    "input": "[[1,0,0,0,1,0,1,0,0,0,1,1],[0,0,0,0,1,1,1,0,0,0,0,1],[1,1,0,0,0,1,0,0,1,0,0,1],[1,1,0,1,0,1,1,1,0,1,0,1],[1,1,0,0,0,1,1,1,0,1,1,0],[1,0,0,1,1,0,1,1,0,1,0,1],[1,0,1,1,0,1,0,0,0,0,1,1],[0,0,1,0,1,0,1,0,1,1,0,0],[1,0,1,1,1,0,1,0,1,0,0,1],[0,0,1,0,0,1,0,0,0,1,1,0],[1,1,0,1,0,0,0,1,0,1,1,1],[1,1,0,0,0,1,0,1,1,1,0,0]]"
  }
];
