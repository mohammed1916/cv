// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated letters replace earlier ending-character contributions",
    "input": "{\"s\":\"cabbacacdbac\"}"
  },
  {
    "label": "One repeated letter creates one subsequence per length",
    "input": "{\"s\":\"zzzzzzz\"}"
  },
  {
    "label": "Distinct characters generate every nonempty selection",
    "input": "{\"s\":\"orbit\"}"
  },
  {
    "label": "Alternating repeats create overlapping duplicate texts",
    "input": "{\"s\":\"abababab\"}"
  }
];
