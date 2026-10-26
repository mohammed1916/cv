// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both mismatch directions occur repeatedly",
    "input": "{\"s1\":\"xxyxyyxyxyxx\",\"s2\":\"yyxxxyyxyyxy\"}"
  },
  {
    "label": "Already equal",
    "input": "{\"s1\":\"xyyxx\",\"s2\":\"xyyxx\"}"
  },
  {
    "label": "One unmatched mismatch is impossible",
    "input": "{\"s1\":\"xxx\",\"s2\":\"xxy\"}"
  },
  {
    "label": "Opposite leftover directions need two swaps",
    "input": "{\"s1\":\"xy\",\"s2\":\"yx\"}"
  }
];
