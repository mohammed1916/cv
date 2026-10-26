// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated letters enter and leave several windows",
    "input": "{\"s\":\"cedarbirchmossfern\",\"k\":5}"
  },
  {
    "label": "Width exceeds the whole string",
    "input": "{\"s\":\"oak\",\"k\":5}"
  },
  {
    "label": "Every character is the same",
    "input": "{\"s\":\"zzzzzz\",\"k\":3}"
  },
  {
    "label": "Single-character windows always qualify",
    "input": "{\"s\":\"pepper\",\"k\":1}"
  }
];
