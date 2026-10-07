// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Cycles connect multiple branches",
    "input": "{\"n\":9,\"edges\":[[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3],[5,6],[6,7],[7,8]],\"source\":1,\"destination\":8}"
  },
  {
    "label": "Disconnected components",
    "input": "{\"n\":6,\"edges\":[[0,1],[1,2],[3,4],[4,5]],\"source\":0,\"destination\":5}"
  },
  {
    "label": "A vertex reaches itself without edges",
    "input": "{\"n\":1,\"edges\":[],\"source\":0,\"destination\":0}"
  },
  {
    "label": "Distinct isolated vertices",
    "input": "{\"n\":3,\"edges\":[],\"source\":0,\"destination\":2}"
  }
];
