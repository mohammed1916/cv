// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Large values may be halved repeatedly before smaller ones",
    "input": "{\"nums\":[45,7,19,3,28,11,6]}"
  },
  {
    "label": "One value needs exactly one halving",
    "input": "{\"nums\":[17]}"
  },
  {
    "label": "Equal values share the reduction work",
    "input": "{\"nums\":[8,8,8,8]}"
  },
  {
    "label": "One dominant value is not always enough for a single operation",
    "input": "{\"nums\":[100,1,1,1]}"
  }
];
