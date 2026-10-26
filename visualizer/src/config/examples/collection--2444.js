// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Bound occurrences compete across out-of-range barriers",
    "input": "{\"nums\":[2,4,6,3,2,6,7,2,5,6,2,1,6],\"minK\":2,\"maxK\":6}"
  },
  {
    "label": "Equal bounds count runs of the one required value",
    "input": "{\"nums\":[4,4,2,4,4,4],\"minK\":4,\"maxK\":4}"
  },
  {
    "label": "A missing required maximum gives zero",
    "input": "{\"nums\":[2,3,4,2],\"minK\":2,\"maxK\":5}"
  },
  {
    "label": "Every out-of-range value blocks all crossing windows",
    "input": "{\"nums\":[1,8,1,8],\"minK\":2,\"maxK\":6}"
  }
];
