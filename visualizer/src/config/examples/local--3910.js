// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Branched tree with competing paths",
    "input": "{\"nums\":[1,0,1,1,0,0,1,1,0],\"edges\":[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[5,7],[5,8]]}"
  },
  {
    "label": "All zero",
    "input": "{\"nums\":[0,0,0,0],\"edges\":[[0,1],[1,2],[2,3]]}"
  },
  {
    "label": "All one",
    "input": "{\"nums\":[1,1,1,1],\"edges\":[[0,1],[0,2],[0,3]]}"
  },
  {
    "label": "Singleton",
    "input": "{\"nums\":[1],\"edges\":[]}"
  },
  {
    "label": "Single node",
    "input": "{\"nums\":[1],\"edges\":[]}"
  },
  {
    "label": "Equal labels joined",
    "input": "{\"nums\":[0,0,1,1],\"edges\":[[0,1],[2,3]]}"
  },
  {
    "label": "Path of 13 nodes",
    "input": "{\"nums\":[1,0,1,0,1,0,1,0,1,0,1,0,1],\"edges\":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12]]}"
  },
  {
    "label": "Long run: 13 nodes",
    "input": "{\"nums\":[1,1,0,1,1,0,1,0,1,1,0,0,0],\"edges\":[[0,5],[1,7],[2,9],[3,11],[4,6],[6,12],[8,10],[10,11]]}"
  }
];
