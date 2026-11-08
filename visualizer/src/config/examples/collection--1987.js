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
  },
  {
    "label": "Single character",
    "input": "{\"binary\":\"1\"}"
  },
  {
    "label": "Alternating characters",
    "input": "{\"binary\":\"0101010101\"}"
  },
  {
    "label": "Sixty ones",
    "input": "{\"binary\":\"111111111111111111111111111111111111111111111111111111111111\"}"
  },
  {
    "label": "Long run: 60 characters",
    "input": "{\"binary\":\"100101001011010011000000010010000100011110000100101001010001\"}"
  }
];
