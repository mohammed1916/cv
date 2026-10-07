// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive and negative pair products create competing alignments",
    "input": "{\"nums1\":[4,-3,7,-2,5],\"nums2\":[-6,2,-4,8]}"
  },
  {
    "label": "Every possible product is negative but an empty result is forbidden",
    "input": "{\"nums1\":[2,5,7],\"nums2\":[-8,-3]}"
  },
  {
    "label": "Negative pairs can make a positive optimum",
    "input": "{\"nums1\":[-5,-2],\"nums2\":[-7,-4]}"
  },
  {
    "label": "A zero product can beat every negative pairing",
    "input": "{\"nums1\":[0,3],\"nums2\":[-5,-2]}"
  }
];
