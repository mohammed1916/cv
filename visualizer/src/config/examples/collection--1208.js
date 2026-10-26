// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Budget grows and shrinks across different costs",
    "input": "{\"s\":\"cedarforest\",\"t\":\"befbsdorftu\",\"maxCost\":7}"
  },
  {
    "label": "Zero budget keeps only equal positions",
    "input": "{\"s\":\"abccdef\",\"t\":\"abzzdef\",\"maxCost\":0}"
  },
  {
    "label": "All positions fit",
    "input": "{\"s\":\"moss\",\"t\":\"nptt\",\"maxCost\":20}"
  },
  {
    "label": "No position fits",
    "input": "{\"s\":\"aaaa\",\"t\":\"zzzz\",\"maxCost\":4}"
  }
];
