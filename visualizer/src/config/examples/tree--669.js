// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Prune both outer regions",
    "input": "{\"root\":[24,11,38,5,17,31,46,2,8,14,20,28,34,42,51],\"low\":12,\"high\":43}"
  },
  {
    "label": "Root itself must disappear",
    "input": "{\"root\":[10,4,17,2,7,14,20],\"low\":12,\"high\":22}"
  },
  {
    "label": "Keep one exact value",
    "input": "{\"root\":[8,3,12,1,6,10,15],\"low\":10,\"high\":10}"
  },
  {
    "label": "Everything excluded",
    "input": "{\"root\":[4,2,7],\"low\":20,\"high\":30}"
  }
];
