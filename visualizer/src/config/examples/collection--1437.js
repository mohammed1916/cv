// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several one gaps meet or exceed the required spacing",
    "input": "{\"nums\":[1,0,0,1,0,0,0,1,0,0,1],\"k\":2}"
  },
  {
    "label": "Adjacent ones fail a positive gap",
    "input": "{\"nums\":[0,1,1,0],\"k\":1}"
  },
  {
    "label": "No ones vacuously satisfy the rule",
    "input": "{\"nums\":[0,0,0,0],\"k\":3}"
  },
  {
    "label": "Zero required spacing allows adjacency",
    "input": "{\"nums\":[1,1,1],\"k\":0}"
  }
];
