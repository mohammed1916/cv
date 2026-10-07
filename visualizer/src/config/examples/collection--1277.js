// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different cell limits produce several square sizes",
    "input": "{\"matrix\":[[1,1,0,1,1],[1,1,1,1,1],[0,1,1,1,0],[1,1,1,1,1]]}"
  },
  {
    "label": "Only zero cells",
    "input": "{\"matrix\":[[0,0],[0,0]]}"
  },
  {
    "label": "Every square of a solid grid counts",
    "input": "{\"matrix\":[[1,1,1],[1,1,1],[1,1,1]]}"
  },
  {
    "label": "Single row has only unit squares",
    "input": "{\"matrix\":[[1,0,1,1,0,1]]}"
  }
];
