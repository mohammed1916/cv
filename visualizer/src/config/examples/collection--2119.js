// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Internal zeros survive both reversals",
    "input": "{\"num\":5070309}"
  },
  {
    "label": "Trailing zeros are lost permanently",
    "input": "{\"num\":48200}"
  },
  {
    "label": "Zero remains zero",
    "input": "{\"num\":0}"
  },
  {
    "label": "A single nonzero digit is unchanged",
    "input": "{\"num\":7}"
  }
];
