// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long declines plateaus and later rises create several candidates",
    "input": "{\"security\":[12,10,8,8,6,6,6,9,11,13,7,7,10],\"time\":2}"
  },
  {
    "label": "Zero neighboring days accepts every position",
    "input": "{\"security\":[9,2,8,1],\"time\":0}"
  },
  {
    "label": "A requirement wider than the array accepts nothing",
    "input": "{\"security\":[4,4,4],\"time\":5}"
  },
  {
    "label": "Equal counts extend both monotone runs",
    "input": "{\"security\":[7,7,7,7,7,7,7],\"time\":2}"
  }
];
