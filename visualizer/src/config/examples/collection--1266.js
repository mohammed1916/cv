// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several ordered segments need different diagonal and straight moves",
    "input": "{\"points\":[[-3,4],[2,9],[7,6],[1,-2],[-5,3],[4,4]]}"
  },
  {
    "label": "One point needs no travel",
    "input": "{\"points\":[[7,-4]]}"
  },
  {
    "label": "Repeated consecutive point",
    "input": "{\"points\":[[2,3],[2,3],[5,7]]}"
  },
  {
    "label": "Horizontal and vertical segments",
    "input": "{\"points\":[[0,0],[8,0],[8,5]]}"
  }
];
