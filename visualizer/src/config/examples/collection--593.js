// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A translated rotated square with unordered vertices",
    "input": "{\"points\":[[9,9],[3,7],[7,5],[5,11]]}"
  },
  {
    "label": "A rectangle has equal diagonals but unequal sides",
    "input": "{\"points\":[[1,2],[9,2],[9,5],[1,5]]}"
  },
  {
    "label": "Repeated vertices cannot make a square",
    "input": "{\"points\":[[2,2],[2,2],[5,5],[5,5]]}"
  },
  {
    "label": "Four collinear points fail the distance pattern",
    "input": "{\"points\":[[-6,3],[-2,3],[2,3],[6,3]]}"
  }
];
