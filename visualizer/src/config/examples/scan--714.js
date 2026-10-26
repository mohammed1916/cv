// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several rises compete with fees",
    "input": "{\"prices\":[4,7,3,9,5,12,6,14,10],\"fee\":3}"
  },
  {
    "label": "Fee erases every gain",
    "input": "{\"prices\":[2,4,3,5],\"fee\":8}"
  },
  {
    "label": "Descending prices",
    "input": "{\"prices\":[15,11,8,4],\"fee\":2}"
  },
  {
    "label": "No selling day",
    "input": "{\"prices\":[7],\"fee\":1}"
  }
];
