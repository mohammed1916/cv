// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated letters create multiple endpoint choices",
    "input": "{\"s\":\"riverlanternriver\"}"
  },
  {
    "label": "Every character matches all earlier positions",
    "input": "{\"s\":\"aaaaaaaaa\"}"
  },
  {
    "label": "Distinct letters permit only singleton substrings",
    "input": "{\"s\":\"abcdefghijk\"}"
  },
  {
    "label": "One character is one substring",
    "input": "{\"s\":\"z\"}"
  }
];
