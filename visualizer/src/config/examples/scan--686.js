// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Target crosses both copy boundaries",
    "input": "{\"a\":\"wxyz\",\"b\":\"yzwxyzwxyzwx\"}"
  },
  {
    "label": "Absent character",
    "input": "{\"a\":\"pqrs\",\"b\":\"pqtr\"}"
  },
  {
    "label": "Target shorter than base",
    "input": "{\"a\":\"marigold\",\"b\":\"rig\"}"
  },
  {
    "label": "Single-letter repetition",
    "input": "{\"a\":\"v\",\"b\":\"vvvvvv\"}"
  }
];
