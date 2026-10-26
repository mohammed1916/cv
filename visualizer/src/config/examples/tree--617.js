// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different shapes overlap at several levels",
    "input": "{\"root1\":[7,3,11,1,5,null,14,null,2],\"root2\":[4,8,6,null,9,5,10,7]}"
  },
  {
    "label": "One input is empty",
    "input": "{\"root1\":[],\"root2\":[6,2,9]}"
  },
  {
    "label": "Overlapping single nodes",
    "input": "{\"root1\":[-4],\"root2\":[9]}"
  },
  {
    "label": "Unmatched opposite branches",
    "input": "{\"root1\":[3,2],\"root2\":[8,null,5]}"
  }
];
