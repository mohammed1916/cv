// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A common remainder allows movement toward the median",
    "input": "{\"grid\":[[5,17,11],[23,8,14],[20,2,26]],\"x\":3}"
  },
  {
    "label": "Different remainders make equality impossible",
    "input": "{\"grid\":[[4,7],[10,12]],\"x\":3}"
  },
  {
    "label": "All cells already agree",
    "input": "{\"grid\":[[9,9,9],[9,9,9]],\"x\":7}"
  },
  {
    "label": "One cell needs no operations",
    "input": "{\"grid\":[[18]],\"x\":5}"
  }
];
