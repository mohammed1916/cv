// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated prefix blocks reuse and extend a Z interval",
    "input": "{\"s\":\"abacababacabaeabacaba\"}"
  },
  {
    "label": "Every suffix of a repeated letter matches the prefix",
    "input": "{\"s\":\"aaaaaaaaa\"}"
  },
  {
    "label": "Distinct letters leave only the whole-string score",
    "input": "{\"s\":\"abcdefghijk\"}"
  },
  {
    "label": "A singleton scores one",
    "input": "{\"s\":\"q\"}"
  }
];
