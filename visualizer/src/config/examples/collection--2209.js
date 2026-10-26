// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "White clusters and black gaps compete for short carpets",
    "input": "{\"floor\":\"11010111100101101\",\"numCarpets\":3,\"carpetLen\":3}"
  },
  {
    "label": "An all-black floor has no uncovered white cost",
    "input": "{\"floor\":\"00000000\",\"numCarpets\":2,\"carpetLen\":3}"
  },
  {
    "label": "A long carpet can cover the entire floor",
    "input": "{\"floor\":\"1011101\",\"numCarpets\":1,\"carpetLen\":10}"
  },
  {
    "label": "No carpet leaves every white tile visible",
    "input": "{\"floor\":\"11001101\",\"numCarpets\":0,\"carpetLen\":2}"
  }
];
