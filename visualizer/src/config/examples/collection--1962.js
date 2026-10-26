// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated maximum choices move between piles",
    "input": "{\"piles\":[31,12,27,8,19,44],\"k\":8}"
  },
  {
    "label": "An odd pile leaves the extra stone",
    "input": "{\"piles\":[15],\"k\":1}"
  },
  {
    "label": "Unit piles cannot lose stones",
    "input": "{\"piles\":[1,1,1,1],\"k\":7}"
  },
  {
    "label": "Tied maxima offer interchangeable choices",
    "input": "{\"piles\":[18,18,18,18],\"k\":4}"
  }
];
