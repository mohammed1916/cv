// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Value chains permit swaps across distant original indices",
    "input": "{\"nums\":[18,4,13,7,21,10,30,16],\"limit\":3}"
  },
  {
    "label": "A gap beyond the limit separates reorderable components",
    "input": "{\"nums\":[9,1,8,2,20],\"limit\":2}"
  },
  {
    "label": "Equal values do not require a positive limit",
    "input": "{\"nums\":[5,3,5,3],\"limit\":0}"
  },
  {
    "label": "A sufficiently large limit permits complete sorting",
    "input": "{\"nums\":[12,4,19,7,2],\"limit\":30}"
  }
];
