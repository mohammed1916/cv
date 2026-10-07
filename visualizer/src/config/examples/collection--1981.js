// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Many row combinations merge into shared totals",
    "input": "{\"mat\":[[3,8,14,19],[2,7,11,18],[5,9,16,22],[1,6,12,17]],\"target\":47}"
  },
  {
    "label": "Every possible total exceeds the target",
    "input": "{\"mat\":[[8,10],[9,12],[7,11]],\"target\":5}"
  },
  {
    "label": "Every possible total is below the target",
    "input": "{\"mat\":[[1,2],[2,3]],\"target\":40}"
  },
  {
    "label": "Duplicate row values produce one state",
    "input": "{\"mat\":[[6,6,6],[4,4,4],[9,9,9]],\"target\":19}"
  }
];
