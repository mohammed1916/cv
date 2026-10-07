// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested arithmetic groups reach several depths",
    "input": "{\"s\":\"(8+(3*(7-(2+1))))/(4+5)\"}"
  },
  {
    "label": "No parentheses",
    "input": "{\"s\":\"7+4*9-2\"}"
  },
  {
    "label": "Separate groups share maximum depth",
    "input": "{\"s\":\"(2+6)*(8-3)+(4/2)\"}"
  },
  {
    "label": "Deep chain",
    "input": "{\"s\":\"((((9))))\"}"
  }
];
