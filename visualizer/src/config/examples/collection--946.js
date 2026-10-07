// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several pushes precede valid pops",
    "input": "{\"pushed\":[8,3,11,5,14,2],\"popped\":[11,5,3,2,14,8]}"
  },
  {
    "label": "Impossible middle pop",
    "input": "{\"pushed\":[4,7,9],\"popped\":[9,4,7]}"
  },
  {
    "label": "Immediate pops",
    "input": "{\"pushed\":[2,6,8],\"popped\":[2,6,8]}"
  },
  {
    "label": "One element",
    "input": "{\"pushed\":[13],\"popped\":[13]}"
  }
];
