// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Removing end runs exposes several nested matches",
    "input": "{\"s\":\"aabccabbaacbbaa\"}"
  },
  {
    "label": "Different ends cannot be removed",
    "input": "{\"s\":\"abcccb\"}"
  },
  {
    "label": "One character must remain",
    "input": "{\"s\":\"c\"}"
  },
  {
    "label": "One repeated run disappears completely",
    "input": "{\"s\":\"bbbbbbb\"}"
  }
];
