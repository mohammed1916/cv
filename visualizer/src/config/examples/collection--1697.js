// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Activate weighted edges across unsorted queries",
    "input": "{\"n\":7,\"edgeList\":[[0,1,4],[1,2,9],[2,3,6],[0,4,12],[4,5,3],[5,6,8],[3,6,15],[1,5,11]],\"queries\":[[0,6,12],[0,3,9],[4,6,9],[0,4,4],[2,6,16]]}"
  },
  {
    "label": "Equal edge weight is excluded",
    "input": "{\"n\":2,\"edgeList\":[[0,1,7]],\"queries\":[[0,1,7],[0,1,8]]}"
  },
  {
    "label": "Disconnected components",
    "input": "{\"n\":4,\"edgeList\":[[0,1,2],[2,3,2]],\"queries\":[[0,3,100]]}"
  },
  {
    "label": "No edges",
    "input": "{\"n\":3,\"edgeList\":[],\"queries\":[[0,1,5],[2,2,1]]}"
  }
];
