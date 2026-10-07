// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated pivots and interleaved groups preserve encounter order",
    "input": "{\"nums\":[12,4,9,3,9,15,2,11,9,6,18],\"pivot\":9}"
  },
  {
    "label": "All values equal the pivot",
    "input": "{\"nums\":[7,7,7,7],\"pivot\":7}"
  },
  {
    "label": "The pivot is absent but still separates two groups",
    "input": "{\"nums\":[8,2,11,1,9,3],\"pivot\":5}"
  },
  {
    "label": "Signed values retain stable order within their groups",
    "input": "{\"nums\":[-2,6,-7,0,-2,4,-9],\"pivot\":-2}"
  }
];
