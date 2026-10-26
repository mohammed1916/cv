// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both tails compete by median distance",
    "input": "{\"arr\":[4,19,7,1,13,22,9,16,5],\"k\":5}"
  },
  {
    "label": "Equal distances prefer larger value",
    "input": "{\"arr\":[1,3,5,7,9],\"k\":2}"
  },
  {
    "label": "Even-length input uses the lower middle median",
    "input": "{\"arr\":[2,4,8,12,16,20],\"k\":3}"
  },
  {
    "label": "Select the entire array",
    "input": "{\"arr\":[6,1,9],\"k\":3}"
  }
];
