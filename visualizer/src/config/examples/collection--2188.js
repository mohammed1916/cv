// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several tire types trade cheap starts against slower degradation",
    "input": "{\"tires\":[[3,2],[2,4],[5,2],[1,7]],\"changeTime\":9,\"numLaps\":12}"
  },
  {
    "label": "One lap needs no tire-change fee",
    "input": "{\"tires\":[[7,3],[4,5],[6,2]],\"changeTime\":20,\"numLaps\":1}"
  },
  {
    "label": "Cheap changes favor frequent fresh tires",
    "input": "{\"tires\":[[2,5],[4,2]],\"changeTime\":1,\"numLaps\":8}"
  },
  {
    "label": "An expensive change makes longer runs worthwhile",
    "input": "{\"tires\":[[1,2],[3,3]],\"changeTime\":40,\"numLaps\":10}"
  }
];
