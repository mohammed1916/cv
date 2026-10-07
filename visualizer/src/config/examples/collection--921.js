// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both unmatched opening and closing groups",
    "input": "{\"s\":\"))(()))((()(\"}"
  },
  {
    "label": "Already balanced",
    "input": "{\"s\":\"(()())()\"}"
  },
  {
    "label": "Only openers",
    "input": "{\"s\":\"((((\"}"
  },
  {
    "label": "Only closers",
    "input": "{\"s\":\")))))\"}"
  }
];
