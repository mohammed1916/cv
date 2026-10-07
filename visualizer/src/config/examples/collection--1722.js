// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several swap components have separate value supplies",
    "input": "{\"source\":[8,3,5,8,2,7,4,3],\"target\":[5,8,3,2,8,4,9,3],\"allowedSwaps\":[[0,1],[1,2],[3,4],[5,6]]}"
  },
  {
    "label": "No swaps permitted",
    "input": "{\"source\":[2,4,6],\"target\":[6,4,2],\"allowedSwaps\":[]}"
  },
  {
    "label": "One connected component matches a permutation",
    "input": "{\"source\":[3,7,2,9],\"target\":[9,2,7,3],\"allowedSwaps\":[[0,1],[1,2],[2,3]]}"
  },
  {
    "label": "Repeated value supplies are limited",
    "input": "{\"source\":[4,4,8],\"target\":[4,8,8],\"allowedSwaps\":[[0,1],[1,2]]}"
  }
];
