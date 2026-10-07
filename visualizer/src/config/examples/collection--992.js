// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated values cause several window expansions and contractions",
    "input": "{\"nums\":[3,1,3,2,1,4,2,4,3,1,2],\"k\":3}"
  },
  {
    "label": "Exactly one distinct value counts repeated-value runs",
    "input": "{\"nums\":[5,5,2,2,2,5],\"k\":1}"
  },
  {
    "label": "Too many requested distinct values gives zero",
    "input": "{\"nums\":[2,3,2,3],\"k\":5}"
  },
  {
    "label": "A singleton can satisfy k one",
    "input": "{\"nums\":[7],\"k\":1}"
  }
];
