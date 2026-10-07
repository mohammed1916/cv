// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Negative nodes move forward while positive nodes keep order",
    "input": "{\"head\":[0,-2,3,-5,7,-9,12,-14]}"
  },
  {
    "label": "An all-negative absolute-sorted list reverses",
    "input": "{\"head\":[-1,-4,-8,-13]}"
  },
  {
    "label": "A nonnegative list is already sorted",
    "input": "{\"head\":[0,2,6,11]}"
  },
  {
    "label": "One node needs no rewiring",
    "input": "{\"head\":[-7]}"
  }
];
