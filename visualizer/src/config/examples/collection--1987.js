// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated prefixes create duplicate subsequences",
    "input": "{\"binary\":\"0010110011010\"}"
  },
  {
    "label": "All zeroes contribute only the single zero",
    "input": "{\"binary\":\"00000000\"}"
  },
  {
    "label": "All ones contribute one string per length",
    "input": "{\"binary\":\"1111111\"}"
  },
  {
    "label": "Only one leading-one subsequence exists",
    "input": "{\"binary\":\"00001\"}"
  }
];
