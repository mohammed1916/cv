// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several runs provide independent move budgets",
    "input": "{\"colors\":\"AAAABBAAAAAABBBBBAAA\"}"
  },
  {
    "label": "Equal move counts make Alice run out first",
    "input": "{\"colors\":\"AAABBB\"}"
  },
  {
    "label": "Alternation offers no legal removal",
    "input": "{\"colors\":\"ABABABAB\"}"
  },
  {
    "label": "One piece has no neighbors",
    "input": "{\"colors\":\"A\"}"
  }
];
