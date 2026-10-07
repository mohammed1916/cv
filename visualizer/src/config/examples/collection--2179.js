// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two longer permutations agree on some but not all triples",
    "input": "{\"nums1\":[4,1,7,0,6,2,8,3,5],\"nums2\":[1,4,0,7,2,6,3,8,5]}"
  },
  {
    "label": "Identical order makes every triple good",
    "input": "{\"nums1\":[0,1,2,3,4,5],\"nums2\":[0,1,2,3,4,5]}"
  },
  {
    "label": "Opposite orders have no common increasing triple",
    "input": "{\"nums1\":[0,1,2,3,4],\"nums2\":[4,3,2,1,0]}"
  },
  {
    "label": "Only one possible triple must be checked",
    "input": "{\"nums1\":[2,0,1],\"nums2\":[2,0,1]}"
  }
];
