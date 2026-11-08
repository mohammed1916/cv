// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shrinking shared rectangle",
    "input": "{\"m\":9,\"n\":11,\"ops\":[[8,10],[6,9],[7,5],[4,8],[5,7]]}"
  },
  {
    "label": "No operations",
    "input": "{\"m\":4,\"n\":7,\"ops\":[]}"
  },
  {
    "label": "Full-grid operation",
    "input": "{\"m\":3,\"n\":5,\"ops\":[[3,5]]}"
  },
  {
    "label": "One maximum cell",
    "input": "{\"m\":6,\"n\":8,\"ops\":[[1,7],[5,1]]}"
  },
  {
    "label": "Single cell grid with no operations",
    "input": "{\"m\":1,\"n\":1,\"ops\":[]}"
  },
  {
    "label": "Repeated identical operations",
    "input": "{\"m\":5,\"n\":5,\"ops\":[[3,4],[3,4],[3,4]]}"
  },
  {
    "label": "Corner operations at the grid edge",
    "input": "{\"m\":12,\"n\":20,\"ops\":[[12,1],[1,20]]}"
  },
  {
    "label": "Long run: 40 operations on a 30 by 25 grid",
    "input": "{\"m\":30,\"n\":25,\"ops\":[[9,21],[12,8],[20,4],[1,15],[9,13],[6,16],[18,13],[27,10],[29,8],[12,6],[3,12],[1,13],[30,8],[2,22],[22,3],[10,18],[20,9],[18,14],[5,4],[8,2],[15,13],[4,4],[25,11],[12,14],[30,23],[9,1],[17,23],[3,1],[11,15],[16,22],[14,19],[13,12],[8,18],[1,10],[1,7],[19,25],[7,23],[30,23],[24,5],[13,20]]}"
  }
];
