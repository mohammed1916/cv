// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several zeros overflow the fixed-length destination",
    "input": "{\"arr\":[6,0,3,0,0,8,2,0,5,9,0,4]}"
  },
  {
    "label": "Last-slot zero cannot duplicate beyond the boundary",
    "input": "{\"arr\":[4,7,0]}"
  },
  {
    "label": "All zeros retain the same length",
    "input": "{\"arr\":[0,0,0,0,0]}"
  },
  {
    "label": "No zeros leave the array unchanged",
    "input": "{\"arr\":[2,5,8,3]}"
  }
];
