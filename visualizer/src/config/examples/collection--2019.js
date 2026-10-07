// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several precedence mistakes compete with the correct result",
    "input": "{\"s\":\"4+2*3+5*2+1\",\"answers\":[21,39,35,27,21,500]}"
  },
  {
    "label": "Every parenthesization agrees for addition only",
    "input": "{\"s\":\"2+3+4\",\"answers\":[9,9,7,14]}"
  },
  {
    "label": "Multiplication by zero changes alternate results",
    "input": "{\"s\":\"7*0+3*2\",\"answers\":[6,42,0,6]}"
  },
  {
    "label": "One operation still scores repeated answers independently",
    "input": "{\"s\":\"8*3\",\"answers\":[24,11,24,32]}"
  }
];
