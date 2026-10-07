// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Asymmetric image with both bit values",
    "input": "{\"matrix\":[[1,0,0,1,1],[0,1,0,0,1],[1,1,1,0,0],[0,0,1,1,0],[1,0,1,0,1]]}"
  },
  {
    "label": "All zeros",
    "input": "{\"matrix\":[[0,0],[0,0]]}"
  },
  {
    "label": "Single bit",
    "input": "{\"matrix\":[[1]]}"
  },
  {
    "label": "Odd center bit",
    "input": "{\"matrix\":[[0,1,0],[1,1,0],[0,0,1]]}"
  }
];
