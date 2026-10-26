// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Fixed hour units limit the leading hour digit",
    "input": "{\"time\":\"?7:?4\"}"
  },
  {
    "label": "Every digit hidden",
    "input": "{\"time\":\"??:??\"}"
  },
  {
    "label": "Fixed twenty-hour prefix",
    "input": "{\"time\":\"2?:3?\"}"
  },
  {
    "label": "Already complete time",
    "input": "{\"time\":\"18:42\"}"
  }
];
