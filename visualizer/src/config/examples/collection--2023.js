// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different split lengths and duplicate strings contribute",
    "input": "{\"nums\":[\"12\",\"34\",\"123\",\"4\",\"1\",\"234\",\"12\",\"34\"],\"target\":\"1234\"}"
  },
  {
    "label": "Equal halves exclude self-pairing",
    "input": "{\"nums\":[\"8\",\"8\",\"8\",\"16\"],\"target\":\"88\"}"
  },
  {
    "label": "No pair can form the target",
    "input": "{\"nums\":[\"21\",\"3\",\"14\"],\"target\":\"777\"}"
  },
  {
    "label": "A single-character target has no nonempty split",
    "input": "{\"nums\":[\"1\",\"2\",\"3\"],\"target\":\"1\"}"
  }
];
