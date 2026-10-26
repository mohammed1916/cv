// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Only isolated first-array values survive all comparisons",
    "input": "{\"arr1\":[-7,2,14,25,8,31,18],\"arr2\":[0,10,21,35],\"d\":3}"
  },
  {
    "label": "Equality at the boundary disqualifies",
    "input": "{\"arr1\":[4,9],\"arr2\":[6],\"d\":2}"
  },
  {
    "label": "Zero distance only rejects exact matches",
    "input": "{\"arr1\":[3,7,11],\"arr2\":[7,15],\"d\":0}"
  },
  {
    "label": "Every candidate is too close",
    "input": "{\"arr1\":[5,6,7],\"arr2\":[6],\"d\":1}"
  }
];
