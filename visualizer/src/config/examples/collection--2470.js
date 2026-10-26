// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several factor combinations reach the same target LCM",
    "input": "{\"nums\":[2,3,4,6,12,5,2,6],\"k\":12}"
  },
  {
    "label": "Every one-only subarray has LCM one",
    "input": "{\"nums\":[1,1,1,1],\"k\":1}"
  },
  {
    "label": "An extra prime makes a start permanently impossible",
    "input": "{\"nums\":[5,2,3,5],\"k\":6}"
  },
  {
    "label": "A target singleton and its extensions are counted separately",
    "input": "{\"nums\":[18,3,6],\"k\":18}"
  }
];
