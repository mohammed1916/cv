// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Smooth descents restart at plateaus larger drops and rises",
    "input": "{\"prices\":[20,19,18,18,16,15,14,21,20,19,17,16]}"
  },
  {
    "label": "A fully smooth run contributes a triangular number",
    "input": "{\"prices\":[9,8,7,6,5,4]}"
  },
  {
    "label": "Equal prices produce only singleton periods",
    "input": "{\"prices\":[8,8,8,8]}"
  },
  {
    "label": "One day is one period",
    "input": "{\"prices\":[42]}"
  }
];
