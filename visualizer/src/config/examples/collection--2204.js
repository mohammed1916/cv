// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Tree branches of different depths attach to one cycle",
    "input": "{\"n\":10,\"edges\":[[0,1],[1,2],[2,3],[3,0],[1,4],[4,5],[5,6],[2,7],[7,8],[3,9]]}"
  },
  {
    "label": "Every vertex already lies on the cycle",
    "input": "{\"n\":5,\"edges\":[[0,1],[1,2],[2,3],[3,4],[4,0]]}"
  },
  {
    "label": "A triangle has one long attached branch",
    "input": "{\"n\":7,\"edges\":[[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,6]]}"
  },
  {
    "label": "Several leaves can peel simultaneously",
    "input": "{\"n\":6,\"edges\":[[0,1],[1,2],[2,0],[0,3],[1,4],[2,5]]}"
  }
];
