// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A larger cyclic Latin square satisfies every line",
    "input": "{\"matrix\":[[1,2,3,4,5],[2,3,4,5,1],[3,4,5,1,2],[4,5,1,2,3],[5,1,2,3,4]]}"
  },
  {
    "label": "Rows may be valid while columns repeat values",
    "input": "{\"matrix\":[[1,2,3],[1,2,3],[1,2,3]]}"
  },
  {
    "label": "A duplicated row value violates the condition",
    "input": "{\"matrix\":[[1,1,3],[2,3,1],[3,2,2]]}"
  },
  {
    "label": "A one-cell square has the full required set",
    "input": "{\"matrix\":[[1]]}"
  }
];
