// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal-strength rows compete by their original index",
    "input": "{\"mat\":[[1,1,1,0,0],[1,0,0,0,0],[1,1,0,0,0],[1,0,0,0,0],[1,1,1,1,0]],\"k\":3}"
  },
  {
    "label": "Empty soldier row is weakest",
    "input": "{\"mat\":[[1,1],[0,0],[1,0]],\"k\":1}"
  },
  {
    "label": "All rows tie",
    "input": "{\"mat\":[[1,0],[1,0],[1,0]],\"k\":2}"
  },
  {
    "label": "Select every row",
    "input": "{\"mat\":[[1,1,1],[1,0,0]],\"k\":2}"
  }
];
