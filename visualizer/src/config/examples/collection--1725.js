// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different orientations share the same square limit",
    "input": "{\"rectangles\":[[8,13],[11,7],[9,9],[15,9],[6,20],[12,8],[9,14]]}"
  },
  {
    "label": "One rectangle",
    "input": "{\"rectangles\":[[5,17]]}"
  },
  {
    "label": "All rectangles tie",
    "input": "{\"rectangles\":[[4,8],[9,4],[4,4]]}"
  },
  {
    "label": "A late larger square resets the count",
    "input": "{\"rectangles\":[[3,9],[7,3],[8,10]]}"
  }
];
