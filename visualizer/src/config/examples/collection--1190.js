// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested groups change traversal direction repeatedly",
    "input": "{\"s\":\"ab(cd(ef)gh)ij(kl)m\"}"
  },
  {
    "label": "No brackets",
    "input": "{\"s\":\"cedar\"}"
  },
  {
    "label": "Empty pair contributes nothing",
    "input": "{\"s\":\"ab()cd\"}"
  },
  {
    "label": "Deeply nested short text",
    "input": "{\"s\":\"(((moss)))\"}"
  }
];
