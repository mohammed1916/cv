// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One large loss can be removed from a profitable interval",
    "input": "{\"arr\":[4,-2,7,-15,6,3,-1,8,-4]}"
  },
  {
    "label": "All negative keeps one element",
    "input": "{\"arr\":[-9,-3,-7,-5]}"
  },
  {
    "label": "No deletion improves all-positive input",
    "input": "{\"arr\":[2,8,4,6]}"
  },
  {
    "label": "Single negative cannot be deleted to empty",
    "input": "{\"arr\":[-11]}"
  }
];
