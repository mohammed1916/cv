// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Subtrees are described before their connections to the root",
    "input": "{\"descriptions\":[[18,9,1],[65,81,0],[40,18,1],[18,27,0],[65,52,1],[40,65,0],[27,23,1]]}"
  },
  {
    "label": "One edge forms the smallest described tree",
    "input": "{\"descriptions\":[[7,12,0]]}"
  },
  {
    "label": "A right-only chain preserves null left positions",
    "input": "{\"descriptions\":[[4,9,0],[9,16,0],[16,25,0]]}"
  },
  {
    "label": "The root need not be the smallest or first parent",
    "input": "{\"descriptions\":[[8,3,1],[8,11,0],[20,8,1],[20,27,0]]}"
  }
];
