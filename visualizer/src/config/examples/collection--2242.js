// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several middle edges compete with conflicting outer candidates",
    "input": "{\"scores\":[8,17,6,25,11,19,4],\"edges\":[[0,1],[1,2],[1,3],[2,3],[3,4],[4,5],[2,5],[5,6],[0,6]]}"
  },
  {
    "label": "A star has no four-distinct-vertex simple path",
    "input": "{\"scores\":[20,9,8,7,6],\"edges\":[[0,1],[0,2],[0,3],[0,4]]}"
  },
  {
    "label": "One chain supplies exactly one four-node sequence",
    "input": "{\"scores\":[3,11,7,18],\"edges\":[[0,1],[1,2],[2,3]]}"
  },
  {
    "label": "Disconnected short components cannot supply four vertices",
    "input": "{\"scores\":[4,8,12,16,20,24],\"edges\":[[0,1],[1,2],[3,4]]}"
  }
];
