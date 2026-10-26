// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal shortest branches merge before the destination",
    "input": "{\"n\":7,\"roads\":[[0,1,2],[0,2,2],[1,3,3],[2,3,3],[1,4,4],[2,4,4],[3,5,2],[4,5,1],[5,6,3],[0,6,20]]}"
  },
  {
    "label": "Unique direct shortest route",
    "input": "{\"n\":3,\"roads\":[[0,1,4],[1,2,5],[0,2,3]]}"
  },
  {
    "label": "A direct road ties two indirect routes",
    "input": "{\"n\":4,\"roads\":[[0,1,2],[1,3,2],[0,2,2],[2,3,2],[0,3,4]]}"
  },
  {
    "label": "Start is already destination",
    "input": "{\"n\":1,\"roads\":[]}"
  }
];
