// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "First non-a before the middle determines the change",
    "input": "{\"palindrome\":\"abccbccba\"}"
  },
  {
    "label": "All a characters require changing the end",
    "input": "{\"palindrome\":\"aaaaaa\"}"
  },
  {
    "label": "Only the odd center differs",
    "input": "{\"palindrome\":\"aazaa\"}"
  },
  {
    "label": "Single character is impossible",
    "input": "{\"palindrome\":\"q\"}"
  }
];
