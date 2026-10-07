// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Some singleton rows share a busy column",
    "input": "{\"mat\":[[1,0,0,0,0],[0,0,1,0,0],[0,1,0,1,0],[0,0,1,0,0],[0,0,0,0,1]]}"
  },
  {
    "label": "Every diagonal entry special",
    "input": "{\"mat\":[[1,0,0],[0,1,0],[0,0,1]]}"
  },
  {
    "label": "All zero cells",
    "input": "{\"mat\":[[0,0,0],[0,0,0]]}"
  },
  {
    "label": "Single one",
    "input": "{\"mat\":[[1]]}"
  }
];
