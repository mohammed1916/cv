// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unmatched brackets mixed with retained words",
    "input": "{\"s\":\"cedar)(grove((path)near))(\"}"
  },
  {
    "label": "No parentheses to remove",
    "input": "{\"s\":\"quietforest\"}"
  },
  {
    "label": "Only unmatched parentheses",
    "input": "{\"s\":\")))(((\"}"
  },
  {
    "label": "Already balanced nested text",
    "input": "{\"s\":\"a(b(c)d)e\"}"
  }
];
