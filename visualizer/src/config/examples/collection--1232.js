// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A longer diagonal line with negative coordinates",
    "input": "{\"coordinates\":[[-6,-9],[-2,-1],[0,3],[3,9],[7,17],[10,23]]}"
  },
  {
    "label": "Vertical line",
    "input": "{\"coordinates\":[[4,-3],[4,0],[4,8]]}"
  },
  {
    "label": "Last point leaves the line",
    "input": "{\"coordinates\":[[1,2],[3,6],[5,11]]}"
  },
  {
    "label": "Any two distinct points define a line",
    "input": "{\"coordinates\":[[-8,3],[7,-4]]}"
  }
];
