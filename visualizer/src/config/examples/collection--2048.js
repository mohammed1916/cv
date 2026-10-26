// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Search beyond a six-digit lower bound",
    "input": "{\"n\":765432}"
  },
  {
    "label": "Zero is below the smallest balanced positive value",
    "input": "{\"n\":0}"
  },
  {
    "label": "An already balanced input still needs a strictly greater result",
    "input": "{\"n\":122}"
  },
  {
    "label": "The largest permitted input crosses into seven digits",
    "input": "{\"n\":1000000}"
  }
];
