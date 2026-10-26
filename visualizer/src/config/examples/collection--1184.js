// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unequal forward and complementary routes",
    "input": "{\"distance\":[7,3,11,4,6,2,9,5],\"start\":6,\"destination\":2}"
  },
  {
    "label": "Same stop needs no travel",
    "input": "{\"distance\":[3,8,2],\"start\":1,\"destination\":1}"
  },
  {
    "label": "Equal routes",
    "input": "{\"distance\":[4,7,4,7],\"start\":0,\"destination\":2}"
  },
  {
    "label": "Zero-weight edges",
    "input": "{\"distance\":[0,0,9,2],\"start\":0,\"destination\":2}"
  }
];
