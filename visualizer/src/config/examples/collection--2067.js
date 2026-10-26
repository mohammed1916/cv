// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different distinct-letter counts create different valid lengths",
    "input": "{\"s\":\"aabbccaabbbccddeedd\",\"count\":2}"
  },
  {
    "label": "One repeated letter creates overlapping valid windows",
    "input": "{\"s\":\"aaaaaaa\",\"count\":3}"
  },
  {
    "label": "Count one requires every present letter to be distinct",
    "input": "{\"s\":\"abacdefa\",\"count\":1}"
  },
  {
    "label": "The required count exceeds the string length",
    "input": "{\"s\":\"cabin\",\"count\":8}"
  }
];
