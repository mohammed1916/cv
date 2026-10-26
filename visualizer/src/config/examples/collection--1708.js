// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Largest array value may be too late to start",
    "input": "{\"nums\":[5,11,3,9,7,15,4,8,20,2],\"k\":4}"
  },
  {
    "label": "Entire array is the only candidate",
    "input": "{\"nums\":[8,2,6,4],\"k\":4}"
  },
  {
    "label": "Length one selects maximum",
    "input": "{\"nums\":[3,12,7,5],\"k\":1}"
  },
  {
    "label": "First legal start wins",
    "input": "{\"nums\":[19,4,8,2,6],\"k\":3}"
  }
];
