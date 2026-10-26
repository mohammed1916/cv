// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Updates split old runs and join new runs across tree boundaries",
    "input": "{\"s\":\"aaabccddddeeff\",\"queryCharacters\":\"dccccaaa\",\"queryIndices\":[3,4,5,6,7,8,0,1]}"
  },
  {
    "label": "Updating a character to itself preserves the result",
    "input": "{\"s\":\"bbbbbb\",\"queryCharacters\":\"bb\",\"queryIndices\":[0,5]}"
  },
  {
    "label": "A one-character segment tree always reports one",
    "input": "{\"s\":\"x\",\"queryCharacters\":\"abc\",\"queryIndices\":[0,0,0]}"
  },
  {
    "label": "Replacing a separator joins two equal runs",
    "input": "{\"s\":\"aaaxaaa\",\"queryCharacters\":\"ab\",\"queryIndices\":[3,2]}"
  }
];
