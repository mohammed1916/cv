// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Large values separated in the source must retain their order",
    "input": "{\"nums\":[4,-8,17,3,12,-5,19,6,14,-2,11],\"k\":5}"
  },
  {
    "label": "Equal values break ties by earlier source position",
    "input": "{\"nums\":[7,2,7,7,1],\"k\":2}"
  },
  {
    "label": "Negative values still require exactly k selections",
    "input": "{\"nums\":[-9,-2,-7,-4,-12],\"k\":3}"
  },
  {
    "label": "Choosing the full length preserves every element",
    "input": "{\"nums\":[6,-3,8,1],\"k\":4}"
  }
];
