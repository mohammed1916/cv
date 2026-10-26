// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicates and adjacent values disqualify different candidates",
    "input": "{\"nums\":[4,9,4,12,17,18,25,31,30,40,12,7]}"
  },
  {
    "label": "Every unique value is adjacent to another",
    "input": "{\"nums\":[5,6,9,10]}"
  },
  {
    "label": "Widely separated singleton values are all lonely",
    "input": "{\"nums\":[2,8,15,23]}"
  },
  {
    "label": "One isolated occurrence is lonely",
    "input": "{\"nums\":[0]}"
  }
];
