// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive and negative stones alter the best take length",
    "input": "{\"stoneValue\":[7,-4,6,2,-9,8,3,-2,5]}"
  },
  {
    "label": "A one-stone game",
    "input": "{\"stoneValue\":[12]}"
  },
  {
    "label": "A negative final value can force a loss",
    "input": "{\"stoneValue\":[-7]}"
  },
  {
    "label": "Zero scores tie regardless of choices",
    "input": "{\"stoneValue\":[0,0,0,0]}"
  }
];
