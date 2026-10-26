// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Left index advances when right values become too small",
    "input": "{\"nums1\":[20,16,13,9,7,4],\"nums2\":[24,20,18,16,15,12,10,8,5,3]}"
  },
  {
    "label": "No eligible value pair",
    "input": "{\"nums1\":[9,8,7],\"nums2\":[3,2,1]}"
  },
  {
    "label": "Equal values allow farthest span",
    "input": "{\"nums1\":[5,5],\"nums2\":[5,5,5,5,5]}"
  },
  {
    "label": "Second array ends before later left indices",
    "input": "{\"nums1\":[8,6,4,2],\"nums2\":[9,7]}"
  }
];
