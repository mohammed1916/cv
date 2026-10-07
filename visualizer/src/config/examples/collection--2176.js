// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated groups include zero-index and nonzero-index divisible pairs",
    "input": "{\"nums\":[5,8,5,5,8,5,2,8,5,2,5,8],\"k\":6}"
  },
  {
    "label": "A divisor of one accepts every equal-value pair",
    "input": "{\"nums\":[4,4,7,4,7],\"k\":1}"
  },
  {
    "label": "Distinct values have no equal pair",
    "input": "{\"nums\":[2,6,10,14],\"k\":3}"
  },
  {
    "label": "Index zero makes its product divisible by any positive k",
    "input": "{\"nums\":[9,3,9],\"k\":97}"
  }
];
