// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Merging paths accumulate ancestors from several independent roots",
    "input": "{\"n\":9,\"edges\":[[0,3],[1,3],[1,4],[2,4],[3,5],[4,5],[4,6],[5,7],[6,7],[7,8]]}"
  },
  {
    "label": "An edgeless graph has no ancestors",
    "input": "{\"n\":4,\"edges\":[]}"
  },
  {
    "label": "A chain accumulates every earlier vertex",
    "input": "{\"n\":5,\"edges\":[[0,1],[1,2],[2,3],[3,4]]}"
  },
  {
    "label": "A diamond reaches the same ancestor along two paths only once",
    "input": "{\"n\":4,\"edges\":[[0,1],[0,2],[1,3],[2,3]]}"
  }
];
