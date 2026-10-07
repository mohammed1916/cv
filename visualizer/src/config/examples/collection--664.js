// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Separated equal letters can share print turns across nested repairs",
    "input": "{\"s\":\"abacbcabca\"}"
  },
  {
    "label": "One repeated run prints in one turn",
    "input": "{\"s\":\"mmmmmm\"}"
  },
  {
    "label": "Distinct letters each need a turn",
    "input": "{\"s\":\"orbit\"}"
  },
  {
    "label": "A repeated outer letter can share a turn around the middle",
    "input": "{\"s\":\"xyzyx\"}"
  }
];
