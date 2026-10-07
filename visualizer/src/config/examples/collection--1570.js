// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Only overlapping nonzero coordinates contribute",
    "input": "{\"nums1\":[0,4,0,-2,7,0,0,3,0,5],\"nums2\":[6,0,2,8,3,0,4,-1,0,2]}"
  },
  {
    "label": "Disjoint support",
    "input": "{\"nums1\":[3,0,4,0],\"nums2\":[0,5,0,6]}"
  },
  {
    "label": "Zero vector",
    "input": "{\"nums1\":[0,0,0],\"nums2\":[4,8,2]}"
  },
  {
    "label": "Single coordinate",
    "input": "{\"nums1\":[-7],\"nums2\":[3]}"
  }
];
