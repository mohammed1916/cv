// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven character runs change the earliest valid start boundary",
    "input": "{\"s\":\"aaacbbacccababbc\"}"
  },
  {
    "label": "Missing one required character yields no valid substring",
    "input": "{\"s\":\"aabbaabb\"}"
  },
  {
    "label": "The minimal three-character coverage contributes one",
    "input": "{\"s\":\"cab\"}"
  },
  {
    "label": "Repeated complete cycles produce many overlapping substrings",
    "input": "{\"s\":\"bcabcabca\"}"
  }
];
