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
  },
  {
    "label": "Two intersections, one road",
    "input": "{\"n\":2,\"roads\":[[0,1,1]]}"
  },
  {
    "label": "Equal times on two routes",
    "input": "{\"n\":4,\"roads\":[[0,1,1],[1,2,1],[0,2,2],[2,3,1]]}"
  },
  {
    "label": "Maximum road time",
    "input": "{\"n\":3,\"roads\":[[0,1,10],[1,2,10],[0,2,10]]}"
  },
  {
    "label": "Long run: 8 intersections, 14 roads",
    "input": "{\"n\":8,\"roads\":[[0,1,5],[1,2,1],[2,3,7],[3,4,5],[4,5,8],[5,6,9],[6,7,9],[1,5,9],[1,6,8],[0,3,8],[0,2,2],[0,4,4],[1,7,2],[0,6,10]]}"
  }
];
