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
  },
  {
    "label": "Single cell",
    "input": "{\"mat\":[[9]],\"target\":9}"
  },
  {
    "label": "Equal values in a 2 by 2",
    "input": "{\"mat\":[[2,2],[2,2]],\"target\":4}"
  },
  {
    "label": "Target above every reachable total",
    "input": "{\"mat\":[[1,2],[3,4]],\"target\":800}"
  },
  {
    "label": "Long run: 12 by 12 matrix",
    "input": "{\"mat\":[[13,19,12,30,60,12,58,67,56,25,42,36],[8,20,5,21,60,46,20,66,17,41,18,33],[42,9,55,55,53,12,9,51,70,20,52,58],[23,63,40,15,5,24,25,4,43,58,29,27],[4,27,3,16,70,45,44,21,59,18,61,18],[58,39,12,70,44,38,68,50,61,62,64,45],[39,68,22,21,25,45,6,28,27,1,35,44],[10,49,26,20,47,13,29,51,50,52,27,28],[9,2,9,29,6,20,56,41,32,10,7,65],[7,63,11,59,38,69,38,69,44,22,56,2],[42,61,16,3,15,33,48,38,56,66,67,53],[28,43,6,14,16,56,31,53,56,28,5,56]],\"target\":300}"
  }
];
