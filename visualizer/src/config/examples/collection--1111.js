// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several primitives with changing nesting depths",
    "input": "{\"seq\":\"((()()))()(((())))()(())\"}"
  },
  {
    "label": "Only shallow pairs",
    "input": "{\"seq\":\"()()()()\"}"
  },
  {
    "label": "One deep primitive",
    "input": "{\"seq\":\"(((((())))))\"}"
  },
  {
    "label": "Single pair",
    "input": "{\"seq\":\"()\"}"
  }
];
