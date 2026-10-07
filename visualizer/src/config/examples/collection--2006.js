// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated values create multiple index pairs",
    "input": "{\"nums\":[3,8,5,3,10,7,5,12,8,10],\"k\":2}"
  },
  {
    "label": "No values differ by the requested amount",
    "input": "{\"nums\":[2,6,10,14],\"k\":3}"
  },
  {
    "label": "Both smaller and larger prior values contribute",
    "input": "{\"nums\":[4,8,6,4,8],\"k\":2}"
  },
  {
    "label": "One entry cannot form a pair",
    "input": "{\"nums\":[9],\"k\":4}"
  }
];
