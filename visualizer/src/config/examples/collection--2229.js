// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shuffled values fill one uninterrupted interval",
    "input": "{\"nums\":[17,13,19,15,14,18,16]}"
  },
  {
    "label": "A duplicate hides a missing interior value",
    "input": "{\"nums\":[4,4,6]}"
  },
  {
    "label": "Distinct values with an interior gap fail the span test",
    "input": "{\"nums\":[8,9,11,12]}"
  },
  {
    "label": "One value forms a consecutive singleton interval",
    "input": "{\"nums\":[31]}"
  }
];
