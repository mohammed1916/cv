// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicates and cross-array membership have different effects",
    "input": "{\"nums1\":[4,4,7,9,12,18],\"nums2\":[2,7,7,12,16],\"nums3\":[4,8,12,18,20]}"
  },
  {
    "label": "Many copies in one array are still one membership",
    "input": "{\"nums1\":[6,6,6,6],\"nums2\":[3],\"nums3\":[9]}"
  },
  {
    "label": "Every value appears in all sources",
    "input": "{\"nums1\":[2,5,11],\"nums2\":[11,2,5],\"nums3\":[5,11,2]}"
  },
  {
    "label": "Only two sources share a value",
    "input": "{\"nums1\":[13],\"nums2\":[13],\"nums3\":[17]}"
  }
];
