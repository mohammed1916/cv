// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Group removals expose earlier surviving runs",
    "input": "{\"s\":\"abbbaccdddcceeef\",\"k\":3}"
  },
  {
    "label": "Complete removal",
    "input": "{\"s\":\"zzzzzz\",\"k\":3}"
  },
  {
    "label": "No run reaches threshold",
    "input": "{\"s\":\"cedar\",\"k\":2}"
  },
  {
    "label": "Cascade across removed middle",
    "input": "{\"s\":\"abba\",\"k\":2}"
  }
];
