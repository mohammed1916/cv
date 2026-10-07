// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several missing gaps and duplicates precede the final appended tail",
    "input": "{\"nums\":[2,5,5,9,14,1,20,8],\"k\":12}"
  },
  {
    "label": "The first missing values lie entirely before the smallest existing value",
    "input": "{\"nums\":[20,30,40],\"k\":5}"
  },
  {
    "label": "A consecutive existing prefix forces the tail to start later",
    "input": "{\"nums\":[1,2,3,4,5,6],\"k\":4}"
  },
  {
    "label": "Repeated existing values block only one positive integer",
    "input": "{\"nums\":[3,3,3,3],\"k\":6}"
  }
];
