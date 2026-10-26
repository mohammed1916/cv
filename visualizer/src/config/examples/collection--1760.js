// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unequal bag sizes change split counts at thresholds",
    "input": "{\"nums\":[19,7,28,13,35,6,22],\"maxOperations\":12}"
  },
  {
    "label": "No splits allowed",
    "input": "{\"nums\":[4,17,9],\"maxOperations\":0}"
  },
  {
    "label": "Enough splits make every bag unit-sized",
    "input": "{\"nums\":[3,5,2],\"maxOperations\":7}"
  },
  {
    "label": "One large bag",
    "input": "{\"nums\":[41],\"maxOperations\":5}"
  }
];
