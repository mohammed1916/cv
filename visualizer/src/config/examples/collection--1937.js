// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Movement cost changes which peaks are worth collecting",
    "input": "{\"points\":[[4,12,3,8,2],[10,1,7,2,13],[3,14,2,9,1],[11,4,8,2,12]]}"
  },
  {
    "label": "One row needs no movement",
    "input": "{\"points\":[[8,2,17,5]]}"
  },
  {
    "label": "One column forces all choices",
    "input": "{\"points\":[[4],[9],[2],[13]]}"
  },
  {
    "label": "Tied zero rewards",
    "input": "{\"points\":[[0,0,0],[0,0,0]]}"
  }
];
