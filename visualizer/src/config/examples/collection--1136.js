// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Parallel starts converge before later courses unlock",
    "input": "{\"n\":8,\"relations\":[[1,4],[2,4],[2,5],[3,5],[4,6],[5,6],[6,7],[5,8]]}"
  },
  {
    "label": "All courses available immediately",
    "input": "{\"n\":4,\"relations\":[]}"
  },
  {
    "label": "Directed cycle blocks completion",
    "input": "{\"n\":3,\"relations\":[[1,2],[2,3],[3,1]]}"
  },
  {
    "label": "One prerequisite chain",
    "input": "{\"n\":5,\"relations\":[[1,2],[2,3],[3,4],[4,5]]}"
  }
];
