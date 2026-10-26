// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several DAG sources feed shared destinations",
    "input": "{\"n\":9,\"edges\":[[0,3],[1,3],[1,4],[2,4],[3,5],[4,5],[5,7],[6,7],[7,8]]}"
  },
  {
    "label": "All vertices isolated",
    "input": "{\"n\":4,\"edges\":[]}"
  },
  {
    "label": "One chain source",
    "input": "{\"n\":5,\"edges\":[[4,3],[3,2],[2,1],[1,0]]}"
  },
  {
    "label": "Single vertex",
    "input": "{\"n\":1,\"edges\":[]}"
  }
];
