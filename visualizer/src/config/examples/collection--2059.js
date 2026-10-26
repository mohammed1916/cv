// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different arithmetic operations cooperate across layers",
    "input": "{\"nums\":[4,7,13],\"start\":6,\"goal\":31}"
  },
  {
    "label": "An out-of-range final goal may be reached directly",
    "input": "{\"nums\":[9],\"start\":2,\"goal\":-7}"
  },
  {
    "label": "Even operations cannot reach an odd goal from an even start",
    "input": "{\"nums\":[2,6],\"start\":4,\"goal\":999}"
  },
  {
    "label": "The start already equals the goal",
    "input": "{\"nums\":[3,8],\"start\":17,\"goal\":17}"
  }
];
