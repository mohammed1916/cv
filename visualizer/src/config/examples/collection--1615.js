// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several hubs share and compete for roads",
    "input": "{\"n\":8,\"roads\":[[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7]]}"
  },
  {
    "label": "No roads",
    "input": "{\"n\":4,\"roads\":[]}"
  },
  {
    "label": "One road counted once",
    "input": "{\"n\":2,\"roads\":[[0,1]]}"
  },
  {
    "label": "Disjoint hubs",
    "input": "{\"n\":6,\"roads\":[[0,1],[0,2],[3,4],[3,5]]}"
  }
];
