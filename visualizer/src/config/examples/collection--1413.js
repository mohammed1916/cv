// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A late negative prefix requires the largest reserve",
    "input": "{\"nums\":[3,-5,2,-7,6,-2,8,-4,1]}"
  },
  {
    "label": "Positive prefixes need only one",
    "input": "{\"nums\":[2,4,7]}"
  },
  {
    "label": "The empty-prefix bound matters for zero",
    "input": "{\"nums\":[0,0,0]}"
  },
  {
    "label": "One negative value",
    "input": "{\"nums\":[-13]}"
  }
];
