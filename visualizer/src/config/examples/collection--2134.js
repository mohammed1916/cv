// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The best circular block may cross the array boundary",
    "input": "{\"nums\":[1,1,0,1,0,0,1,0,1,1,0,1]}"
  },
  {
    "label": "No ones need no swaps",
    "input": "{\"nums\":[0,0,0,0]}"
  },
  {
    "label": "An all-one circle is already grouped",
    "input": "{\"nums\":[1,1,1,1,1]}"
  },
  {
    "label": "A wraparound group is already contiguous",
    "input": "{\"nums\":[1,1,0,0,0,1]}"
  }
];
