// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unequal input lengths still redistribute evenly",
    "input": "{\"words\":[\"aabbcc\",\"abc\",\"abcabcabc\"]}"
  },
  {
    "label": "One leftover character prevents equality",
    "input": "{\"words\":[\"aab\",\"abb\",\"ab\"]}"
  },
  {
    "label": "One word is always redistributable",
    "input": "{\"words\":[\"forest\"]}"
  },
  {
    "label": "Already equal words",
    "input": "{\"words\":[\"moss\",\"moss\",\"moss\"]}"
  }
];
