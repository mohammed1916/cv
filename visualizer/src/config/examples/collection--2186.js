// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several letters need appending on opposite sides",
    "input": "{\"s\":\"lanternriver\",\"t\":\"winterharbor\"}"
  },
  {
    "label": "Existing anagrams need no appended letters",
    "input": "{\"s\":\"listen\",\"t\":\"silent\"}"
  },
  {
    "label": "Disjoint alphabets require appending both full strings",
    "input": "{\"s\":\"aaaa\",\"t\":\"zzzzz\"}"
  },
  {
    "label": "One repeated-letter deficit has a direct count",
    "input": "{\"s\":\"mmmmmm\",\"t\":\"mm\"}"
  }
];
