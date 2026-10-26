// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Target occurs on both sides of the starting index",
    "input": "{\"nums\":[7,2,9,4,7,6,3,7,8,2,7],\"target\":7,\"start\":6}"
  },
  {
    "label": "Start already equals target",
    "input": "{\"nums\":[4,8,6],\"target\":8,\"start\":1}"
  },
  {
    "label": "Only target is at the far end",
    "input": "{\"nums\":[2,3,4,5,9],\"target\":9,\"start\":0}"
  },
  {
    "label": "Equidistant targets",
    "input": "{\"nums\":[6,2,3,4,6],\"target\":6,\"start\":2}"
  }
];
