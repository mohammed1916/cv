// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated fetch positions refer to a changing queue",
    "input": "{\"n\":9,\"fetches\":[4,1,7,3,9,2,5,1,8]}"
  },
  {
    "label": "Fetching last leaves order unchanged",
    "input": "{\"n\":4,\"fetches\":[4,4,4]}"
  },
  {
    "label": "Always fetch first",
    "input": "{\"n\":5,\"fetches\":[1,1,1,1,1,1]}"
  },
  {
    "label": "Single item queue",
    "input": "{\"n\":1,\"fetches\":[1,1,1]}"
  }
];
