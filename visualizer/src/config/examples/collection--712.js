// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shared letters compete with their different deletion costs",
    "input": "{\"s1\":\"stargazer\",\"s2\":\"trailblazer\"}"
  },
  {
    "label": "Identical text costs nothing to retain",
    "input": "{\"s1\":\"orbit\",\"s2\":\"orbit\"}"
  },
  {
    "label": "No shared letters requires deleting both strings",
    "input": "{\"s1\":\"abc\",\"s2\":\"xyz\"}"
  },
  {
    "label": "Repeated letters permit several alignments",
    "input": "{\"s1\":\"babaab\",\"s2\":\"abbaba\"}"
  }
];
