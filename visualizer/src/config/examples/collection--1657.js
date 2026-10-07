// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Same letters carry permuted frequencies",
    "input": "{\"word1\":\"aaaaabbbbcccdde\",\"word2\":\"abbcccddddeeeee\"}"
  },
  {
    "label": "Same frequencies but different letters",
    "input": "{\"word1\":\"aabbcc\",\"word2\":\"aabbdd\"}"
  },
  {
    "label": "Same letters but incompatible frequencies",
    "input": "{\"word1\":\"aaaabbc\",\"word2\":\"aaabbbc\"}"
  },
  {
    "label": "Identical words",
    "input": "{\"word1\":\"forest\",\"word2\":\"forest\"}"
  }
];
