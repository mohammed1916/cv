// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both directions have competing last exits",
    "input": "{\"n\":24,\"left\":[3,11,19],\"right\":[2,8,17,22]}"
  },
  {
    "label": "Only left-moving ants",
    "input": "{\"n\":15,\"left\":[4,13],\"right\":[]}"
  },
  {
    "label": "Only right-moving ants",
    "input": "{\"n\":18,\"left\":[],\"right\":[6,14]}"
  },
  {
    "label": "Ants already exit at endpoints",
    "input": "{\"n\":9,\"left\":[0],\"right\":[9]}"
  }
];
