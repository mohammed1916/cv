// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive and negative values need balanced group cardinality",
    "input": "{\"nums\":[8,-3,14,5,-9,11,2,-6,17,-4,7,1]}"
  },
  {
    "label": "Two values form two singleton groups",
    "input": "{\"nums\":[-12,7]}"
  },
  {
    "label": "Repeated equal values permit an exact balance",
    "input": "{\"nums\":[6,6,6,6,6,6]}"
  },
  {
    "label": "Odd total cannot be split into equal integer sums",
    "input": "{\"nums\":[1,4,7,9]}"
  }
];
