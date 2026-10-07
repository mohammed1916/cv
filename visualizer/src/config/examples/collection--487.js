// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different one-zero windows compete across a longer binary array",
    "input": "{\"nums\":[1,1,0,1,1,1,0,1,1,0,1,1,1,1]}"
  },
  {
    "label": "All ones need no flip",
    "input": "{\"nums\":[1,1,1,1,1,1]}"
  },
  {
    "label": "All zeros can contribute only one flipped position",
    "input": "{\"nums\":[0,0,0,0]}"
  },
  {
    "label": "A zero between two runs joins them with one flip",
    "input": "{\"nums\":[1,1,1,0,1,1,1,1]}"
  }
];
