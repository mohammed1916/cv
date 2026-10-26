// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A long a prefix is followed by a b suffix",
    "input": "{\"s\":\"aaaaaaaabbbbbbb\"}"
  },
  {
    "label": "An a after several bs breaks the order",
    "input": "{\"s\":\"aaabbbabbb\"}"
  },
  {
    "label": "Only a letters satisfies the rule",
    "input": "{\"s\":\"aaaaaa\"}"
  },
  {
    "label": "Only b letters satisfies the rule",
    "input": "{\"s\":\"bbbbbbbb\"}"
  }
];
