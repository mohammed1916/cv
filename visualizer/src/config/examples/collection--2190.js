// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several successors compete across repeated key occurrences",
    "input": "{\"nums\":[4,8,4,3,4,8,7,4,2,4,8,4,3],\"key\":4}"
  },
  {
    "label": "A final key has no following value",
    "input": "{\"nums\":[6,9,6],\"key\":6}"
  },
  {
    "label": "Consecutive keys can make the key its own successor",
    "input": "{\"nums\":[5,5,5,2,5,5,3],\"key\":5}"
  },
  {
    "label": "One qualifying adjacent pair determines the answer",
    "input": "{\"nums\":[1,7,12,4],\"key\":7}"
  }
];
