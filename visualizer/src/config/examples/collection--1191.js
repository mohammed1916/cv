// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive whole-copy totals reward additional copies",
    "input": "{\"arr\":[5,-7,4,6,-2,3],\"k\":5}"
  },
  {
    "label": "Negative total makes extra copies unhelpful",
    "input": "{\"arr\":[4,-12,3],\"k\":7}"
  },
  {
    "label": "All negative allows the empty subarray",
    "input": "{\"arr\":[-3,-8,-2],\"k\":4}"
  },
  {
    "label": "One copy has no wraparound",
    "input": "{\"arr\":[6,-9,7],\"k\":1}"
  }
];
