// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Negative values require prefix dominance rather than a plain sum window",
    "input": "{\"nums\":[4,-6,8,3,-2,7,-9,6,5],\"k\":13}"
  },
  {
    "label": "A later singleton can beat every earlier multi-value answer",
    "input": "{\"nums\":[2,-3,4,1,12],\"k\":10}"
  },
  {
    "label": "No qualifying subarray returns minus one",
    "input": "{\"nums\":[-4,2,-3,1],\"k\":7}"
  },
  {
    "label": "An exact threshold sum qualifies",
    "input": "{\"nums\":[3,-1,5],\"k\":7}"
  }
];
