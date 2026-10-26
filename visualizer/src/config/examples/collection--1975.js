// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Odd negative parity leaves the smallest magnitude negative",
    "input": "{\"matrix\":[[-8,4,11],[6,-13,2],[7,5,-9]]}"
  },
  {
    "label": "Zero absorbs an otherwise odd negative sign",
    "input": "{\"matrix\":[[-5,0],[7,12]]}"
  },
  {
    "label": "Even negative parity permits all positive magnitudes",
    "input": "{\"matrix\":[[-4,9],[6,-3]]}"
  },
  {
    "label": "All values are already nonnegative",
    "input": "{\"matrix\":[[2,8,4],[7,3,10],[5,6,1]]}"
  }
];
