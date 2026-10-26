// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several friendship groups merge over time",
    "input": "{\"n\":7,\"logs\":[[40,0,1],[12,2,3],[65,4,5],[28,1,2],[81,5,6],[93,3,4],[100,0,6]]}"
  },
  {
    "label": "Two people connect immediately",
    "input": "{\"n\":2,\"logs\":[[7,0,1]]}"
  },
  {
    "label": "One isolated person prevents completion",
    "input": "{\"n\":4,\"logs\":[[2,0,1],[5,1,2]]}"
  },
  {
    "label": "Redundant friendships do not reduce components",
    "input": "{\"n\":4,\"logs\":[[1,0,1],[2,1,2],[3,0,2],[4,2,3]]}"
  }
];
