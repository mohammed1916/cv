// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal values and later smaller values require full depth-aware search",
    "input": "{\"nums\":[2,5,3,3,6,4,7,7]}"
  },
  {
    "label": "Equal values may extend a nondecreasing subsequence",
    "input": "{\"nums\":[4,4,4,4]}"
  },
  {
    "label": "Strictly decreasing values have no length-two result",
    "input": "{\"nums\":[9,7,5,3,1]}"
  },
  {
    "label": "A singleton cannot produce a qualifying subsequence",
    "input": "{\"nums\":[12]}"
  }
];
