// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Longer words redistribute a few occurrences per letter",
    "input": "{\"word1\":\"aabbccddeeffgg\",\"word2\":\"abcdeffgabcdef\"}"
  },
  {
    "label": "A difference of exactly three remains allowed",
    "input": "{\"word1\":\"aaabbb\",\"word2\":\"bbbccc\"}"
  },
  {
    "label": "A difference of four fails",
    "input": "{\"word1\":\"aaaabbbb\",\"word2\":\"bbbbcccc\"}"
  },
  {
    "label": "Identical words trivially satisfy every bound",
    "input": "{\"word1\":\"lantern\",\"word2\":\"lantern\"}"
  }
];
