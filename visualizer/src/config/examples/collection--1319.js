// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Cycles provide spare cables for isolated network components",
    "input": "{\"n\":8,\"connections\":[[0,1],[1,2],[2,0],[2,3],[3,0],[4,5],[5,6],[6,4]]}"
  },
  {
    "label": "Too few cables makes reconnection impossible",
    "input": "{\"n\":6,\"connections\":[[0,1],[1,2],[3,4]]}"
  },
  {
    "label": "An already connected network needs no relocation",
    "input": "{\"n\":5,\"connections\":[[0,1],[1,2],[2,3],[3,4]]}"
  },
  {
    "label": "One computer is already connected",
    "input": "{\"n\":1,\"connections\":[]}"
  }
];
