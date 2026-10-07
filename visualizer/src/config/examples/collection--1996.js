// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal attacks mix with genuinely stronger characters",
    "input": "{\"properties\":[[7,3],[7,9],[4,8],[9,7],[5,2],[9,4],[3,10],[11,6]]}"
  },
  {
    "label": "Equal attack alone never dominates",
    "input": "{\"properties\":[[6,2],[6,5],[6,9]]}"
  },
  {
    "label": "Equal defense alone never dominates",
    "input": "{\"properties\":[[2,7],[5,7],[9,7]]}"
  },
  {
    "label": "One character has no dominator",
    "input": "{\"properties\":[[12,4]]}"
  }
];
