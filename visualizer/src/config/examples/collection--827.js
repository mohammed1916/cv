// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One water cell can bridge differently sized islands",
    "input": "{\"grid\":[[1,1,0,1,0],[1,0,0,1,1],[0,1,0,0,1],[0,1,1,0,0],[1,0,0,1,1]]}"
  },
  {
    "label": "All land already occupies the full area",
    "input": "{\"grid\":[[1,1,1],[1,1,1],[1,1,1]]}"
  },
  {
    "label": "All water gains exactly one land cell",
    "input": "{\"grid\":[[0,0],[0,0]]}"
  },
  {
    "label": "The same surrounding island must not count four times",
    "input": "{\"grid\":[[1,1,1],[1,0,1],[1,1,1]]}"
  }
];
