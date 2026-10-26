// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Negative, zero, and positive products share the rank order",
    "input": "{\"nums1\":[-8,-3,0,2,7],\"nums2\":[-6,-1,0,4,9],\"k\":14}"
  },
  {
    "label": "All products are negative with reversed per-row order",
    "input": "{\"nums1\":[-7,-2],\"nums2\":[3,5,11],\"k\":4}"
  },
  {
    "label": "Duplicate products occupy distinct pair ranks",
    "input": "{\"nums1\":[0,0,3],\"nums2\":[-2,0,4],\"k\":6}"
  },
  {
    "label": "A single product fixes the answer without a search",
    "input": "{\"nums1\":[-9],\"nums2\":[6],\"k\":1}"
  }
];
