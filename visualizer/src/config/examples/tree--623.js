// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Insert across a wide middle frontier",
    "input": "{\"root\":[24,11,38,5,17,31,46,2,8,14,20,28,34,42,51],\"val\":7,\"depth\":3}"
  },
  {
    "label": "Replace the root",
    "input": "{\"root\":[8,3,12],\"val\":2,\"depth\":1}"
  },
  {
    "label": "Insert below deepest nodes",
    "input": "{\"root\":[5,2,9],\"val\":4,\"depth\":3}"
  },
  {
    "label": "Sparse frontier",
    "input": "{\"root\":[6,null,10,8],\"val\":3,\"depth\":3}"
  },
  {
    "label": "Single root at depth one",
    "input": "{\"root\":[4],\"val\":9,\"depth\":1}"
  },
  {
    "label": "Insert under a single child",
    "input": "{\"root\":[2,1],\"val\":5,\"depth\":2}"
  },
  {
    "label": "Extreme values at the limits",
    "input": "{\"root\":[100,-100,100],\"val\":-100,\"depth\":2}"
  },
  {
    "label": "Long run: 30-node tree",
    "input": "{\"root\":[68,null,-28,-53,17,44,-70,-51,null,-8,-79,null,null,-95,null,-33,-26,-46,20,85,-95,72,-64,null,-68,13,95,54,-17,null],\"val\":1,\"depth\":4}"
  }
];
