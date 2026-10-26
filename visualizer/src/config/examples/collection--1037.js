// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Slanted edges enclose a nonzero area",
    "input": "{\"points\":[[3,8],[11,5],[7,14]]}"
  },
  {
    "label": "Vertical points are collinear without needing division",
    "input": "{\"points\":[[4,1],[4,8],[4,13]]}"
  },
  {
    "label": "Repeated coordinates cannot make a triangle",
    "input": "{\"points\":[[6,2],[9,7],[6,2]]}"
  },
  {
    "label": "Diagonal points remain collinear",
    "input": "{\"points\":[[2,3],[6,9],[10,15]]}"
  }
];
