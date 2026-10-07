// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Cheap cycles compete with needed bridges",
    "input": "{\"n\":6,\"connections\":[[1,2,4],[2,3,3],[1,3,9],[3,4,7],[4,5,2],[5,6,5],[4,6,8],[2,6,15]]}"
  },
  {
    "label": "Disconnected city groups",
    "input": "{\"n\":4,\"connections\":[[1,2,3],[3,4,5]]}"
  },
  {
    "label": "Two cities and one edge",
    "input": "{\"n\":2,\"connections\":[[1,2,13]]}"
  },
  {
    "label": "Equal-cost alternative trees",
    "input": "{\"n\":4,\"connections\":[[1,2,6],[2,3,6],[3,4,6],[4,1,6]]}"
  }
];
