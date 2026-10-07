// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal-valued endpoints become eligible at different activation levels",
    "input": "{\"vals\":[4,2,4,1,2,4,3,3],\"edges\":[[0,1],[1,2],[1,3],[3,4],[4,5],[4,6],[6,7]]}"
  },
  {
    "label": "All equal values make every endpoint pair good",
    "input": "{\"vals\":[7,7,7,7],\"edges\":[[0,1],[1,2],[1,3]]}"
  },
  {
    "label": "Distinct values leave only singleton good paths",
    "input": "{\"vals\":[2,5,8,11],\"edges\":[[0,1],[1,2],[2,3]]}"
  },
  {
    "label": "One node contributes one path",
    "input": "{\"vals\":[9],\"edges\":[]}"
  }
];
