// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Editable positions can repair several internal imbalances",
    "input": "{\"s\":\")(()))(()(\",\"locked\":\"0011010000\"}"
  },
  {
    "label": "Odd length cannot be repaired",
    "input": "{\"s\":\"(()\",\"locked\":\"000\"}"
  },
  {
    "label": "A locked closing prefix fails the forward check",
    "input": "{\"s\":\")(\",\"locked\":\"10\"}"
  },
  {
    "label": "A locked opening suffix fails the backward check",
    "input": "{\"s\":\"((\",\"locked\":\"01\"}"
  }
];
