// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rolling averages cross and touch the threshold",
    "input": "{\"arr\":[4,9,2,8,6,3,11,5,7,1,10],\"k\":3,\"threshold\":6}"
  },
  {
    "label": "Every average equals the threshold",
    "input": "{\"arr\":[5,5,5,5],\"k\":2,\"threshold\":5}"
  },
  {
    "label": "One window covers the whole array",
    "input": "{\"arr\":[2,8,4,6],\"k\":4,\"threshold\":6}"
  },
  {
    "label": "Width one uses individual values",
    "input": "{\"arr\":[3,7,2,9],\"k\":1,\"threshold\":7}"
  }
];
