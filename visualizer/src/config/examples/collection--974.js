// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Negative values require normalized remainders",
    "input": "{\"nums\":[7,-3,5,2,-6,4,8,-2,1],\"k\":5}"
  },
  {
    "label": "Every zero contributes",
    "input": "{\"nums\":[0,0,0],\"k\":7}"
  },
  {
    "label": "Divisor one",
    "input": "{\"nums\":[3,-2,8],\"k\":1}"
  },
  {
    "label": "No divisible subarray",
    "input": "{\"nums\":[1,1],\"k\":4}"
  }
];
