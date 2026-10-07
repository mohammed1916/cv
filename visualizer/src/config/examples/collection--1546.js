// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Greedy closures reset prefix history",
    "input": "{\"nums\":[4,-1,2,3,-2,5,1,-3,6,-1,2],\"target\":5}"
  },
  {
    "label": "Zero values give separate intervals",
    "input": "{\"nums\":[0,0,0,0],\"target\":0}"
  },
  {
    "label": "No target interval",
    "input": "{\"nums\":[2,4,6],\"target\":3}"
  },
  {
    "label": "Whole array is one match",
    "input": "{\"nums\":[3,7,2],\"target\":12}"
  }
];
