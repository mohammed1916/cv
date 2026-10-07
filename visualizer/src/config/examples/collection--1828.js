// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Multiple circles include interior and boundary points",
    "input": "{\"points\":[[2,3],[5,7],[8,3],[6,5],[9,9],[1,6],[4,4],[10,5]],\"queries\":[[5,3,3],[6,6,4],[2,6,2]]}"
  },
  {
    "label": "Boundary points count",
    "input": "{\"points\":[[3,4],[0,5],[5,0]],\"queries\":[[0,0,5]]}"
  },
  {
    "label": "No point inside",
    "input": "{\"points\":[[20,20],[25,30]],\"queries\":[[2,2,3]]}"
  },
  {
    "label": "Repeated positions count separately",
    "input": "{\"points\":[[4,4],[4,4],[7,7]],\"queries\":[[4,4,1]]}"
  }
];
