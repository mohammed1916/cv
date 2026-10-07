// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Three pointers advance at different rates",
    "input": "{\"arr1\":[1,4,7,9,12,16,20],\"arr2\":[2,4,8,9,15,16,21],\"arr3\":[0,4,6,9,16,18,22]}"
  },
  {
    "label": "No shared value",
    "input": "{\"arr1\":[1,3],\"arr2\":[2,4],\"arr3\":[5,6]}"
  },
  {
    "label": "All values shared",
    "input": "{\"arr1\":[2,5,9],\"arr2\":[2,5,9],\"arr3\":[2,5,9]}"
  },
  {
    "label": "Only final value matches",
    "input": "{\"arr1\":[1,8],\"arr2\":[3,8],\"arr3\":[6,8]}"
  }
];
