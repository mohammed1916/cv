// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A match appears after several failed positions",
    "input": "{\"nums\":[9,8,7,6,5,5,4,3,2,1,0,1]}"
  },
  {
    "label": "Modulo ten wraps at later indices",
    "input": "{\"nums\":[8,8,8,8,8,8,8,8,9,8,0]}"
  },
  {
    "label": "No stored digit matches its index",
    "input": "{\"nums\":[2,3,4,5,6]}"
  },
  {
    "label": "Index zero can be the first match",
    "input": "{\"nums\":[0,7,3]}"
  }
];
