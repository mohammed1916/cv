// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Recover a longer chain of adjacent XOR values",
    "input": "{\"encoded\":[6,13,9,3,12,5,10,7],\"first\":11}"
  },
  {
    "label": "One encoded pair",
    "input": "{\"encoded\":[9],\"first\":4}"
  },
  {
    "label": "Zero encodings repeat the preceding value",
    "input": "{\"encoded\":[0,0,0],\"first\":7}"
  },
  {
    "label": "First value is zero",
    "input": "{\"encoded\":[5,3,6],\"first\":0}"
  }
];
