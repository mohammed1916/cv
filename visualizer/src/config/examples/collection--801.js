// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several local swaps restore two longer increasing sequences",
    "input": "{\"nums1\":[1,7,5,11,9,15],\"nums2\":[2,4,8,8,12,12]}"
  },
  {
    "label": "Already increasing sequences need no swaps",
    "input": "{\"nums1\":[1,3,6,9],\"nums2\":[2,5,8,12]}"
  },
  {
    "label": "A final swap repairs both strict inequalities",
    "input": "{\"nums1\":[1,4,7,6],\"nums2\":[2,3,5,10]}"
  },
  {
    "label": "Single-element sequences are already increasing",
    "input": "{\"nums1\":[8],\"nums2\":[3]}"
  }
];
