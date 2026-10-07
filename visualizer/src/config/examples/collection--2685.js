// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A triangle a noncomplete path and isolated vertices coexist",
    "input": "{\"n\":9,\"edges\":[[0,1],[1,2],[0,2],[3,4],[4,5],[6,7]]}"
  },
  {
    "label": "All isolated vertices are complete components",
    "input": "{\"n\":5,\"edges\":[]}"
  },
  {
    "label": "A four-node clique is one complete component",
    "input": "{\"n\":4,\"edges\":[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]}"
  },
  {
    "label": "One missing clique edge prevents completeness",
    "input": "{\"n\":4,\"edges\":[[0,1],[0,2],[0,3],[1,2],[1,3]]}"
  }
];
