// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A deeper BST becomes one bidirectional sorted cycle",
    "input": "{\"root\":[30,14,52,7,21,43,68,null,10,18,25,39,47,61,75]}"
  },
  {
    "label": "One original node links to itself in both directions",
    "input": "{\"root\":[11]}"
  },
  {
    "label": "A skewed tree still produces sorted circular order",
    "input": "{\"root\":[4,null,9,null,16,null,25]}"
  },
  {
    "label": "An empty tree produces an empty list",
    "input": "{\"root\":[]}"
  }
];
