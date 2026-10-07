// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A moving five-value window produces many centered averages",
    "input": "{\"nums\":[8,3,14,6,11,2,19,7,5,16,4,12,9,20,1],\"k\":2}"
  },
  {
    "label": "Radius zero preserves each value",
    "input": "{\"nums\":[7,2,11,4],\"k\":0}"
  },
  {
    "label": "The required window is wider than the input",
    "input": "{\"nums\":[3,8,5],\"k\":4}"
  },
  {
    "label": "Integer division drops the fractional part",
    "input": "{\"nums\":[1,2,2,4,6],\"k\":1}"
  }
];
