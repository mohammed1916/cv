// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mapped leading zeros and ties retain original positions",
    "input": "{\"mapping\":[4,0,7,2,9,1,8,5,3,6],\"nums\":[12,2,101,0,45,91,120,11,5]}"
  },
  {
    "label": "Identity mapping is ordinary stable numeric sorting",
    "input": "{\"mapping\":[0,1,2,3,4,5,6,7,8,9],\"nums\":[31,4,18,4,0]}"
  },
  {
    "label": "Zero is mapped as one digit rather than an empty representation",
    "input": "{\"mapping\":[9,8,7,6,5,4,3,2,1,0],\"nums\":[0,9,90,99,10]}"
  },
  {
    "label": "Equal original values remain repeated occurrences",
    "input": "{\"mapping\":[1,2,3,4,5,6,7,8,9,0],\"nums\":[22,7,22,9,7]}"
  }
];
