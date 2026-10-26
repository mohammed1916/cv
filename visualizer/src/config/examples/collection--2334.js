// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A low boundary can reveal a longer qualifying interior span",
    "input": "{\"nums\":[2,7,8,9,6,1,5],\"threshold\":24}"
  },
  {
    "label": "Strict equality is not enough",
    "input": "{\"nums\":[4,4,4],\"threshold\":12}"
  },
  {
    "label": "A single large value can be the answer",
    "input": "{\"nums\":[1,2,20,3],\"threshold\":15}"
  },
  {
    "label": "The full plateau qualifies when the threshold is slightly lower",
    "input": "{\"nums\":[6,6,6,6],\"threshold\":23}"
  }
];
