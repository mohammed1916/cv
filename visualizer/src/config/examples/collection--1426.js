// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated occurrences share one successor membership test",
    "input": "{\"arr\":[4,5,4,8,9,2,3,8,12,13,13]}"
  },
  {
    "label": "No value has its successor",
    "input": "{\"arr\":[2,5,8,11]}"
  },
  {
    "label": "A full chain excludes only its maximum",
    "input": "{\"arr\":[3,4,5,6,7]}"
  },
  {
    "label": "Duplicate maximum values do not qualify",
    "input": "{\"arr\":[6,6,6]}"
  }
];
