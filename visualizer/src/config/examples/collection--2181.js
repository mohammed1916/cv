// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several differently sized runs become one sum node each",
    "input": "{\"head\":[0,4,7,2,0,9,0,3,8,6,1,0,5,12,0]}"
  },
  {
    "label": "One positive value between delimiters remains its own sum",
    "input": "{\"head\":[0,17,0]}"
  },
  {
    "label": "Single-node runs produce the same sequence of values",
    "input": "{\"head\":[0,2,0,5,0,8,0]}"
  },
  {
    "label": "A long run becomes one output node",
    "input": "{\"head\":[0,1,3,5,7,9,11,0]}"
  }
];
