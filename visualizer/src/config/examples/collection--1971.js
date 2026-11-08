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
  },
  {
    "label": "Two vertices and one edge",
    "input": "{\"n\":2,\"edges\":[[0,1]],\"source\":1,\"destination\":0}"
  },
  {
    "label": "Target in another component",
    "input": "{\"n\":4,\"edges\":[[0,1],[2,3]],\"source\":0,\"destination\":3}"
  },
  {
    "label": "Source equals destination",
    "input": "{\"n\":5,\"edges\":[[0,1]],\"source\":3,\"destination\":3}"
  },
  {
    "label": "Long run: 16 vertices on a path plus extra edges",
    "input": "{\"n\":16,\"edges\":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[12,3],[12,11],[7,15],[3,12],[4,9]],\"source\":0,\"destination\":15}"
  }
];
