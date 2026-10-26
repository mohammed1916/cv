// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Horizontal gaps ignore large vertical differences",
    "input": "{\"points\":[[12,9],[3,-7],[25,4],[8,30],[19,-12],[4,8],[31,2],[19,40]]}"
  },
  {
    "label": "All x coordinates coincide",
    "input": "{\"points\":[[7,1],[7,9],[7,-4]]}"
  },
  {
    "label": "Two points",
    "input": "{\"points\":[[-8,3],[11,3]]}"
  },
  {
    "label": "Repeated coordinates do not create width",
    "input": "{\"points\":[[2,4],[2,8],[9,1],[9,5]]}"
  }
];
