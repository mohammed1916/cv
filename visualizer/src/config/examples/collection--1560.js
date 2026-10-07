// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated wraps count each entered sector",
    "input": "{\"n\":8,\"rounds\":[6,2,7,3,8,4]}"
  },
  {
    "label": "Short nonwrapping segment",
    "input": "{\"n\":7,\"rounds\":[2,5]}"
  },
  {
    "label": "One full circuit ties every sector",
    "input": "{\"n\":5,\"rounds\":[3,2]}"
  },
  {
    "label": "Starting sector visited again",
    "input": "{\"n\":6,\"rounds\":[4,1,4]}"
  }
];
