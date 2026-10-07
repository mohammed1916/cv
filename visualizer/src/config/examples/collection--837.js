// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A partial terminal-score range requires probability accumulation",
    "input": "{\"n\":28,\"k\":24,\"maxPts\":10}"
  },
  {
    "label": "Zero stopping threshold ends the game immediately",
    "input": "{\"n\":0,\"k\":0,\"maxPts\":7}"
  },
  {
    "label": "A bound above every stopping score makes success certain",
    "input": "{\"n\":30,\"k\":18,\"maxPts\":8}"
  },
  {
    "label": "Draws of one stop at a deterministic score",
    "input": "{\"n\":9,\"k\":9,\"maxPts\":1}"
  }
];
