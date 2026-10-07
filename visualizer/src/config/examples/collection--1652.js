// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Forward neighbors wrap around the end",
    "input": "{\"code\":[6,2,9,4,7,3,8,5],\"k\":3}"
  },
  {
    "label": "Backward neighbors wrap around the beginning",
    "input": "{\"code\":[4,9,2,7,5],\"k\":-2}"
  },
  {
    "label": "Zero asks for no neighbors",
    "input": "{\"code\":[8,3,6],\"k\":0}"
  },
  {
    "label": "Every other position contributes",
    "input": "{\"code\":[2,5,8,11],\"k\":3}"
  }
];
