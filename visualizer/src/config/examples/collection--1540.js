// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated shift distances need separate move cycles",
    "input": "{\"s\":\"abczxyab\",\"t\":\"bcdayzbc\",\"k\":131}"
  },
  {
    "label": "Repeated shift misses its deadline",
    "input": "{\"s\":\"aaa\",\"t\":\"bbb\",\"k\":52}"
  },
  {
    "label": "Equal strings need no moves",
    "input": "{\"s\":\"orchard\",\"t\":\"orchard\",\"k\":0}"
  },
  {
    "label": "Different lengths cannot convert",
    "input": "{\"s\":\"pine\",\"t\":\"pines\",\"k\":100}"
  }
];
