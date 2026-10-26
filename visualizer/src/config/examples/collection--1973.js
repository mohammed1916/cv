// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several subtrees satisfy the descendant sum rule",
    "input": "{\"root\":[18,3,6,1,2,0,6]}"
  },
  {
    "label": "A zero leaf equals its empty descendant sum",
    "input": "{\"root\":[0]}"
  },
  {
    "label": "An ordinary nonzero leaf does not match",
    "input": "{\"root\":[9]}"
  },
  {
    "label": "Missing children preserve level-order positions",
    "input": "{\"root\":[12,5,7,null,5,0,7]}"
  }
];
