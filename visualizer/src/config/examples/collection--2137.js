// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several donors and receivers balance after transfer loss",
    "input": "{\"buckets\":[3,18,7,25,11,30],\"loss\":20}"
  },
  {
    "label": "No loss makes the common level the average",
    "input": "{\"buckets\":[2,8,14,20],\"loss\":0}"
  },
  {
    "label": "Equal buckets need no transfer",
    "input": "{\"buckets\":[9,9,9,9],\"loss\":75}"
  },
  {
    "label": "High transfer loss keeps the target near the lowest bucket",
    "input": "{\"buckets\":[1,100],\"loss\":99}"
  }
];
