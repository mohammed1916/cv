// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Zero runs create repeated prefix sums",
    "input": "{\"nums\":[1,0,0,1,0,1,1,0,0,1],\"goal\":2}"
  },
  {
    "label": "All zeros and zero target",
    "input": "{\"nums\":[0,0,0,0],\"goal\":0}"
  },
  {
    "label": "Target is unreachable",
    "input": "{\"nums\":[0,1,0],\"goal\":3}"
  },
  {
    "label": "One matching bit",
    "input": "{\"nums\":[1],\"goal\":1}"
  }
];
