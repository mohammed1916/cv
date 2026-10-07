// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several overlong runs need independent deletions",
    "input": "{\"s\":\"aaaabbbbbccdddddeeeeffg\"}"
  },
  {
    "label": "Already valid paired runs",
    "input": "{\"s\":\"aabbccddeeff\"}"
  },
  {
    "label": "One long repeated run",
    "input": "{\"s\":\"zzzzzzzzzz\"}"
  },
  {
    "label": "One character needs no deletion",
    "input": "{\"s\":\"q\"}"
  }
];
