// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different internal structure, same leaf order",
    "input": "{\"root1\":[9,4,14,2,6,11,18],\"root2\":[5,2,7,null,null,6,8,null,null,11,18]}"
  },
  {
    "label": "Only leaf order differs",
    "input": "{\"root1\":[8,2,5],\"root2\":[9,5,2]}"
  },
  {
    "label": "Equal single leaves",
    "input": "{\"root1\":[13],\"root2\":[13]}"
  },
  {
    "label": "Different leaf counts",
    "input": "{\"root1\":[4,2,6],\"root2\":[2]}"
  }
];
