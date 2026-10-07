// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A matching cross-string shell leaves a palindromic center",
    "input": "{\"a\":\"abcxyxuvwx\",\"b\":\"pqrxyxqcba\"}"
  },
  {
    "label": "Single characters always qualify",
    "input": "{\"a\":\"q\",\"b\":\"z\"}"
  },
  {
    "label": "No matching outer endpoints",
    "input": "{\"a\":\"abcd\",\"b\":\"efgh\"}"
  },
  {
    "label": "A whole original string is palindromic",
    "input": "{\"a\":\"rotator\",\"b\":\"orchard\"}"
  }
];
