// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Large values compete for singleton groups within a fixed group budget",
    "input": "{\"nums\":[8,2,6,1,9,3,7,4],\"k\":3}"
  },
  {
    "label": "One group is simply the whole-array average",
    "input": "{\"nums\":[3,7,2,8],\"k\":1}"
  },
  {
    "label": "One group per value yields the original sum",
    "input": "{\"nums\":[2,5,8,4],\"k\":4}"
  },
  {
    "label": "Equal values make every same-group-count partition equivalent",
    "input": "{\"nums\":[6,6,6,6,6],\"k\":3}"
  }
];
