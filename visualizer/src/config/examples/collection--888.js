// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Find a balancing exchange among several sizes",
    "input": "{\"aliceSizes\":[4,8,6,10,2],\"bobSizes\":[3,7,5,9]}"
  },
  {
    "label": "Equal totals allow equal exchange",
    "input": "{\"aliceSizes\":[3,7],\"bobSizes\":[7,3]}"
  },
  {
    "label": "Only one box each",
    "input": "{\"aliceSizes\":[8],\"bobSizes\":[8]}"
  },
  {
    "label": "Repeated box sizes",
    "input": "{\"aliceSizes\":[2,2,6],\"bobSizes\":[4,4,6]}"
  }
];
