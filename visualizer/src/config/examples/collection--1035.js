// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated numbers create competing noncrossing alignments",
    "input": "{\"nums1\":[3,7,2,7,5,2,9],\"nums2\":[7,3,7,2,9,5,2]}"
  },
  {
    "label": "Disjoint values permit no lines",
    "input": "{\"nums1\":[1,3,5],\"nums2\":[2,4,6]}"
  },
  {
    "label": "Equal repeats connect only as many positions as both arrays contain",
    "input": "{\"nums1\":[8,8,8,8],\"nums2\":[8,8]}"
  },
  {
    "label": "Identical arrays connect every position",
    "input": "{\"nums1\":[4,1,7,3],\"nums2\":[4,1,7,3]}"
  }
];
