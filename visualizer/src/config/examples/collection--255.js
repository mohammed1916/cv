// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several left subtrees finish before the traversal enters right subtrees",
    "input": "{\"preorder\":[40,18,9,12,27,23,31,65,52,59,81]}"
  },
  {
    "label": "A late value crosses an established lower bound",
    "input": "{\"preorder\":[20,10,5,15,30,8]}"
  },
  {
    "label": "Ascending preorder describes a right-only chain",
    "input": "{\"preorder\":[2,6,11,17,24]}"
  },
  {
    "label": "Descending preorder describes a left-only chain",
    "input": "{\"preorder\":[25,19,13,8,3]}"
  }
];
