// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several alphabet runs compete across repeated and skipped letters",
    "input": "{\"s\":\"mnoptabcdeffghijkzab\"}"
  },
  {
    "label": "Alphabet wrapping does not extend a run",
    "input": "{\"s\":\"xyzabc\"}"
  },
  {
    "label": "Repeated letters reset every step",
    "input": "{\"s\":\"qqqqqq\"}"
  },
  {
    "label": "A complete alphabet is one continuous run",
    "input": "{\"s\":\"abcdefghijklmnopqrstuvwxyz\"}"
  }
];
