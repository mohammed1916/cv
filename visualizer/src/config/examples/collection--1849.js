// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Leading zeros preserve a descending chain",
    "input": "{\"s\":\"100099098097\"}"
  },
  {
    "label": "Single digit cannot form two parts",
    "input": "{\"s\":\"7\"}"
  },
  {
    "label": "Zeros cannot descend below zero",
    "input": "{\"s\":\"00000\"}"
  },
  {
    "label": "Two numeric chunks finish at zero",
    "input": "{\"s\":\"001000\"}"
  }
];
