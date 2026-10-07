// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested and reversed groups mix",
    "input": "{\"s\":\"]]][[[]][[][\"}"
  },
  {
    "label": "Already balanced nested groups",
    "input": "{\"s\":\"[[[]]][[]]\"}"
  },
  {
    "label": "All closing brackets precede all openings",
    "input": "{\"s\":\"]]]][[[[\"}"
  },
  {
    "label": "One reversed pair",
    "input": "{\"s\":\"][\"}"
  }
];
