// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Multiple primitives with different internal nesting",
    "input": "{\"s\":\"((()()))(()(()))()(())\"}"
  },
  {
    "label": "Every primitive is an empty pair",
    "input": "{\"s\":\"()()()()\"}"
  },
  {
    "label": "One deeply nested primitive",
    "input": "{\"s\":\"((((()))))\"}"
  },
  {
    "label": "Only one outer pair",
    "input": "{\"s\":\"()\"}"
  }
];
