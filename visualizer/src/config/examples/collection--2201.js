// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several nonoverlapping artifacts have different missing cells",
    "input": "{\"n\":6,\"artifacts\":[[0,0,0,2],[1,3,2,4],[3,0,4,0],[4,3,5,4]],\"dig\":[[0,0],[0,1],[0,2],[1,3],[1,4],[2,3],[3,0],[4,0],[4,3],[4,4],[5,3],[5,4]]}"
  },
  {
    "label": "One remaining covered cell prevents extraction",
    "input": "{\"n\":2,\"artifacts\":[[0,0,1,1]],\"dig\":[[0,0],[0,1],[1,0]]}"
  },
  {
    "label": "A single-cell artifact needs one excavation",
    "input": "{\"n\":3,\"artifacts\":[[2,1,2,1]],\"dig\":[[2,1]]}"
  },
  {
    "label": "Digging elsewhere does not uncover the artifact",
    "input": "{\"n\":4,\"artifacts\":[[0,0,0,1]],\"dig\":[[3,2],[3,3]]}"
  }
];
