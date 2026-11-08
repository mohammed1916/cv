// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Cycles and shared neighbors",
    "input": "[[2,3],[1,3,4],[1,2,5],[2,5,6],[3,4,6],[4,5]]"
  },
  {
    "label": "One isolated vertex",
    "input": "[[]]"
  },
  {
    "label": "One edge",
    "input": "[[2],[1]]"
  },
  {
    "label": "Empty graph",
    "input": "[]"
  },
  {
    "label": "Triangle of equal neighbours",
    "input": "[[2,3],[1,3],[1,2]]"
  },
  {
    "label": "Boundary: 20 node path",
    "input": "[[2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,8],[7,9],[8,10],[9,11],[10,12],[11,13],[12,14],[13,15],[14,16],[15,17],[16,18],[17,19],[18,20],[19]]"
  },
  {
    "label": "Long run: 20 node graph",
    "input": "[[2,9,13,18],[1,3],[2,4,8,17],[3,5,15,16],[4,6,16],[5,7,14],[6,8,14],[3,7,9,12],[1,8,10,13,14,17],[9,11],[10,12],[8,11,13,16],[1,9,12,14],[6,7,9,13,15,19],[4,14,16,17,20],[4,5,12,15,17],[3,9,15,16,18],[1,17,19],[14,18,20],[15,19]]"
  }
];
