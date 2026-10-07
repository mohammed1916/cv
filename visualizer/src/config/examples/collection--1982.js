// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed signs, a zero, and repeated subset sums",
    "input": "{\"n\":4,\"sums\":[0,-2,3,1,5,3,8,6,0,-2,3,1,5,3,8,6]}"
  },
  {
    "label": "Every recovered element is zero",
    "input": "{\"n\":3,\"sums\":[0,0,0,0,0,0,0,0]}"
  },
  {
    "label": "Negative elements require selecting the upper half",
    "input": "{\"n\":2,\"sums\":[0,-3,-5,-8]}"
  },
  {
    "label": "Repeated positive elements preserve multiplicities",
    "input": "{\"n\":3,\"sums\":[0,2,2,4,4,6,6,8]}"
  }
];
