// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unsorted query budgets must keep their original output order",
    "input": "{\"items\":[[8,17],[3,6],[12,24],[8,21],[5,13],[19,18],[14,31]],\"queries\":[13,2,8,20,5,12]}"
  },
  {
    "label": "Equal-price items compete by beauty",
    "input": "{\"items\":[[7,3],[7,19],[7,11]],\"queries\":[6,7,8]}"
  },
  {
    "label": "Higher prices need not offer higher beauty",
    "input": "{\"items\":[[2,40],[5,12],[9,6]],\"queries\":[1,3,10]}"
  },
  {
    "label": "One item and repeated budgets",
    "input": "{\"items\":[[11,25]],\"queries\":[11,11,10]}"
  }
];
