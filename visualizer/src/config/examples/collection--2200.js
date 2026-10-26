// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping key neighborhoods form one ordered union",
    "input": "{\"nums\":[3,8,2,8,5,1,8,4,7,8,6,2,8],\"key\":8,\"k\":2}"
  },
  {
    "label": "Radius zero returns exactly key positions",
    "input": "{\"nums\":[4,2,4,7,4],\"key\":4,\"k\":0}"
  },
  {
    "label": "A large radius covers the entire array",
    "input": "{\"nums\":[2,5,9,3,1],\"key\":9,\"k\":20}"
  },
  {
    "label": "No key occurrence covers any index",
    "input": "{\"nums\":[1,3,5,7],\"key\":2,\"k\":3}"
  }
];
