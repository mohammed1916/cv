// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Multiple cascading deletions across a longer stream",
    "input": "{\"s\":\"xyxyzzpqxyzxyzrxyzz\",\"part\":\"xyz\"}"
  },
  {
    "label": "A deletion exposes a new overlapping boundary",
    "input": "{\"s\":\"aabcbc\",\"part\":\"abc\"}"
  },
  {
    "label": "No occurrence exists",
    "input": "{\"s\":\"harborlantern\",\"part\":\"zz\"}"
  },
  {
    "label": "All characters disappear",
    "input": "{\"s\":\"kkkkkk\",\"part\":\"kk\"}"
  }
];
