// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Deep tree with one late mismatch",
    "input": "{\"root\":[6,6,6,6,6,6,6,null,null,6,6,null,null,6,7]}"
  },
  {
    "label": "All nodes agree",
    "input": "{\"root\":[3,3,3,3,null,3,3]}"
  },
  {
    "label": "Root differs from child",
    "input": "{\"root\":[4,5]}"
  },
  {
    "label": "One node",
    "input": "{\"root\":[0]}"
  }
];
