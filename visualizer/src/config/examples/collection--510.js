// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The right subtree contains several smaller successor candidates",
    "input": "{\"root\":[40,18,72,9,27,56,88,4,13,23,31,49,63,81,95],\"target\":40}"
  },
  {
    "label": "Climb past several right-child ancestors",
    "input": "{\"root\":[40,18,72,9,27,56,88,null,null,23,31],\"target\":31}"
  },
  {
    "label": "The maximum node has no successor",
    "input": "{\"root\":[16,8,24,3,12,20,29],\"target\":29}"
  },
  {
    "label": "A single-node tree also has no successor",
    "input": "{\"root\":[17],\"target\":17}"
  }
];
