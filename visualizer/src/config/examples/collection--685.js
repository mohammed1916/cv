// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A later parent conflicts with a larger rooted tree",
    "input": "{\"edges\":[[1,2],[1,3],[2,4],[2,5],[3,6],[5,6]]}"
  },
  {
    "label": "A pure directed cycle requires its latest cycle edge",
    "input": "{\"edges\":[[1,2],[2,3],[3,4],[4,5],[5,1]]}"
  },
  {
    "label": "A two-parent conflict and cycle require the earlier parent edge",
    "input": "{\"edges\":[[2,1],[3,1],[4,2],[1,4]]}"
  },
  {
    "label": "The later conflicting parent edge can itself close the cycle",
    "input": "{\"edges\":[[1,2],[2,3],[3,4],[4,2]]}"
  }
];
