// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A long sorted prefix and suffix can meet after a short removal",
    "input": "{\"arr\":[1,3,5,8,12,4,6,9,13,15]}"
  },
  {
    "label": "Already sorted values require no removal",
    "input": "{\"arr\":[2,2,4,7,7]}"
  },
  {
    "label": "A descending array keeps just one element",
    "input": "{\"arr\":[9,7,5,3,1]}"
  },
  {
    "label": "Equal boundary values allow a valid merge",
    "input": "{\"arr\":[1,2,2,9,8,2,2,3]}"
  }
];
