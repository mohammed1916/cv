// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated blocks begin after a distracting prefix",
    "input": "{\"arr\":[9,4,7,4,7,4,7,4,7,2],\"m\":2,\"k\":4}"
  },
  {
    "label": "Insufficient room",
    "input": "{\"arr\":[2,5,2],\"m\":2,\"k\":2}"
  },
  {
    "label": "Length one pattern",
    "input": "{\"arr\":[8,3,3,3,3,9],\"m\":1,\"k\":4}"
  },
  {
    "label": "One mismatch breaks the run",
    "input": "{\"arr\":[2,6,2,6,2,7],\"m\":2,\"k\":3}"
  }
];
