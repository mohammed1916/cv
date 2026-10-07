// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Alternative subsequence matches survive early removals",
    "input": "{\"s\":\"abacabadabacaba\",\"p\":\"acaba\",\"removable\":[1,3,5,7,9,11,13,0,2,4]}"
  },
  {
    "label": "First removal immediately breaks the subsequence",
    "input": "{\"s\":\"forest\",\"p\":\"forest\",\"removable\":[2,4]}"
  },
  {
    "label": "All requested removals are harmless",
    "input": "{\"s\":\"axbxcxd\",\"p\":\"abcd\",\"removable\":[1,3,5]}"
  },
  {
    "label": "Empty removal list",
    "input": "{\"s\":\"cedar\",\"p\":\"car\",\"removable\":[]}"
  }
];
