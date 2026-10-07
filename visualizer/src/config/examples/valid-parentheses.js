// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested and adjacent groups",
    "s": "{[()()]([])}([]{})",
    "input": "{[()()]([])}([]{})"
  },
  {
    "label": "Wrong closing order",
    "s": "{[(])}",
    "input": "{[(])}"
  },
  {
    "label": "Unclosed prefix",
    "s": "(([]{})",
    "input": "(([]{})"
  },
  {
    "label": "Closer without opener",
    "s": "]()",
    "input": "]()"
  },
  {
    "label": "Empty stack throughout",
    "s": "",
    "input": ""
  }
];
