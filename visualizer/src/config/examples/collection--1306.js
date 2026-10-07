// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Reachable branches revisit candidates without looping",
    "input": "{\"arr\":[5,3,0,2,4,1,2,3,1],\"start\":4}"
  },
  {
    "label": "Already at zero",
    "input": "{\"arr\":[2,0,3],\"start\":1}"
  },
  {
    "label": "Cycle has no reachable zero",
    "input": "{\"arr\":[1,1,1,1],\"start\":0}"
  },
  {
    "label": "Both jumps immediately leave the array",
    "input": "{\"arr\":[7,0,3],\"start\":0}"
  }
];
