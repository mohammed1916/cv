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
  },
  {
    "label": "Single value",
    "input": "{\"nums\":[7],\"k\":1}"
  },
  {
    "label": "Equal values",
    "input": "{\"nums\":[5,5,5,5],\"k\":2}"
  },
  {
    "label": "Extreme values with the largest k",
    "input": "{\"nums\":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1],\"k\":99}"
  },
  {
    "label": "Long run: 40 values",
    "input": "{\"nums\":[70,70,22,22,16,31,45,60,33,85,95,7,54,61,85,28,99,20,79,74,84,18,78,27,27,13,55,48,31,17,88,10,84,61,98,97,61,56,17,2],\"k\":7}"
  }
];
