// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Branched tree with competing paths",
    "input": "{\"nums\":[1,0,1,1,0,0,1,1,0],\"edges\":[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[5,7],[5,8]]}"
  },
  {
    "label": "All zero",
    "input": "{\"nums\":[0,0,0,0],\"edges\":[[0,1],[1,2],[2,3]]}"
  },
  {
    "label": "All one",
    "input": "{\"nums\":[1,1,1,1],\"edges\":[[0,1],[0,2],[0,3]]}"
  },
  {
    "label": "Singleton",
    "input": "{\"nums\":[1],\"edges\":[]}"
  }
];
