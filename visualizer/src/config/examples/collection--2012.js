// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Global ordering and local ordering award different scores",
    "input": "{\"nums\":[4,2,5,7,6,9,11,8,13]}"
  },
  {
    "label": "Every interior value earns two",
    "input": "{\"nums\":[2,5,9,14,20]}"
  },
  {
    "label": "Equal neighbors prevent strict beauty",
    "input": "{\"nums\":[6,6,6,6]}"
  },
  {
    "label": "Only one interior position exists",
    "input": "{\"nums\":[8,3,12]}"
  },
  {
    "label": "Three equal values",
    "input": "[5,5,5]"
  },
  {
    "label": "Descending run",
    "input": "[9,7,5,3,1]"
  },
  {
    "label": "Alternating extremes",
    "input": "[100,1,100,1,100,1]"
  },
  {
    "label": "Long run: 30 values",
    "input": "[21,81,75,72,81,40,21,63,17,39,83,29,10,48,46,84,68,54,75,100,34,16,49,88,95,100,36,34,92,38]"
  }
];
