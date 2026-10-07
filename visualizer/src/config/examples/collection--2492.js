// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A low-weight detour improves the route score",
    "input": "{\"n\":7,\"roads\":[[1,2,18],[2,7,14],[2,3,9],[3,4,2],[4,5,11],[5,6,16]]}"
  },
  {
    "label": "A smaller edge in another component is irrelevant",
    "input": "{\"n\":5,\"roads\":[[1,2,8],[2,5,12],[3,4,1]]}"
  },
  {
    "label": "One road is the complete path",
    "input": "{\"n\":2,\"roads\":[[1,2,23]]}"
  },
  {
    "label": "Cycles allow repeated visits without changing the minimum rule",
    "input": "{\"n\":4,\"roads\":[[1,2,15],[2,3,7],[3,1,10],[3,4,19]]}"
  }
];
