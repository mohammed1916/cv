// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A long central target block exceeds half",
    "input": "{\"nums\":[1,2,7,7,7,7,7,7,9,12],\"target\":7}"
  },
  {
    "label": "Exactly half is not a majority",
    "input": "{\"nums\":[2,2,5,5],\"target\":2}"
  },
  {
    "label": "Target absent",
    "input": "{\"nums\":[1,3,6,8],\"target\":4}"
  },
  {
    "label": "Single matching value",
    "input": "{\"nums\":[9],\"target\":9}"
  }
];
