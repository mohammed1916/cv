// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shared values and duplicates leave two distinct differences",
    "input": "{\"nums1\":[4,7,4,12,18,7,25,3],\"nums2\":[7,9,18,9,30,4,11]}"
  },
  {
    "label": "Identical sets yield two empty differences",
    "input": "{\"nums1\":[2,2,5,8],\"nums2\":[8,5,2,8]}"
  },
  {
    "label": "Disjoint sets keep all distinct values",
    "input": "{\"nums1\":[1,3,5],\"nums2\":[2,4,6]}"
  },
  {
    "label": "Signed values follow ordinary set membership",
    "input": "{\"nums1\":[-4,0,7,-4],\"nums2\":[0,-9,7]}"
  }
];
