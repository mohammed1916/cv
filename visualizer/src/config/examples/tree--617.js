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
  },
  {
    "label": "Single node with a missing child",
    "input": "{\"root1\":[0],\"root2\":[0,null,1]}"
  },
  {
    "label": "Extreme values merge",
    "input": "{\"root1\":[10000,-10000],\"root2\":[-10000,10000]}"
  },
  {
    "label": "Equal shapes merge fully",
    "input": "{\"root1\":[1,2,3],\"root2\":[4,5,6]}"
  },
  {
    "label": "Long run: two 30-node trees",
    "input": "{\"root1\":[41,46,8,36,32,-6,79,8,-47,null,-21,64,-62,-60,89,-83,-69,25,54,-91,77,null,-7,null,-3,25,-66,-79,-52,-72],\"root2\":[91,71,null,null,0,-37,null,null,-3,-10,-31,99,-88,null,39,-68,2,null,44,64,52,-6,-76,-86,null,-88,64,-21,-18,62]}"
  }
];
