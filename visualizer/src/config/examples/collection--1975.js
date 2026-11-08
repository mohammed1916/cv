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
  },
  {
    "label": "All zeros",
    "input": "[[0,0],[0,0]]"
  },
  {
    "label": "Extreme values in a 2 by 2",
    "input": "[[100000,-100000],[-100000,100000]]"
  },
  {
    "label": "Equal entries in a 3 by 3",
    "input": "[[3,3,3],[3,3,3],[3,3,3]]"
  },
  {
    "label": "Long run: 4 by 4 matrix",
    "input": "[[-399,779,-483,821],[-794,-121,-201,617],[960,246,629,697],[351,636,-603,893]]"
  }
];
