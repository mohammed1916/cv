// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different gcd categories combine missing factors of twelve",
    "input": "{\"nums\":[6,5,8,9,12,7,4,18,10,3],\"k\":12}"
  },
  {
    "label": "Divisor one accepts every pair",
    "input": "{\"nums\":[3,7,11,16],\"k\":1}"
  },
  {
    "label": "Prime divisor requires a multiple in each qualifying pair",
    "input": "{\"nums\":[2,5,14,9,21,4],\"k\":7}"
  },
  {
    "label": "No pair supplies the necessary factors",
    "input": "{\"nums\":[1,3,5,7],\"k\":8}"
  }
];
