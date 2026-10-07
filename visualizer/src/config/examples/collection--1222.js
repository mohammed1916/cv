// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Near queens block farther queens on multiple rays",
    "input": "{\"queens\":[[0,3],[2,3],[6,3],[3,0],[3,6],[1,1],[0,0],[5,5],[2,6]],\"king\":[3,3]}"
  },
  {
    "label": "King in the corner",
    "input": "{\"queens\":[[0,5],[6,0],[4,4]],\"king\":[0,0]}"
  },
  {
    "label": "No queen shares a ray",
    "input": "{\"queens\":[[1,2],[2,5],[5,6]],\"king\":[3,3]}"
  },
  {
    "label": "One nearest queen on the row",
    "input": "{\"queens\":[[4,2],[4,0]],\"king\":[4,6]}"
  }
];
