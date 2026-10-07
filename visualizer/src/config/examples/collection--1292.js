// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Prefix rectangles expose different low-sum corners",
    "input": "{\"mat\":[[2,5,1,4,3],[3,1,2,2,6],[4,2,0,1,2],[5,3,1,2,4]],\"threshold\":15}"
  },
  {
    "label": "Zero cells permit the whole square",
    "input": "{\"mat\":[[0,0,0],[0,0,0],[0,0,0]],\"threshold\":0}"
  },
  {
    "label": "No single cell fits",
    "input": "{\"mat\":[[4,6],[7,5]],\"threshold\":3}"
  },
  {
    "label": "Rectangular dimensions limit square size",
    "input": "{\"mat\":[[1,1,1,1],[1,1,1,1]],\"threshold\":10}"
  }
];
