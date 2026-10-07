// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping light intervals meet different local thresholds",
    "input": "{\"n\":12,\"lights\":[[1,2],[4,3],[7,2],[10,3],[5,0]],\"requirement\":[1,1,2,2,3,3,2,2,3,2,1,1]}"
  },
  {
    "label": "No lights still meets zero requirements",
    "input": "{\"n\":5,\"lights\":[],\"requirement\":[0,1,0,2,0]}"
  },
  {
    "label": "A large radius is clipped to both street ends",
    "input": "{\"n\":4,\"lights\":[[2,10]],\"requirement\":[1,1,2,0]}"
  },
  {
    "label": "A zero-radius light affects only its own position",
    "input": "{\"n\":3,\"lights\":[[1,0]],\"requirement\":[1,1,1]}"
  }
];
