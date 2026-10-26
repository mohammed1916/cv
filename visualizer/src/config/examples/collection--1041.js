// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several turns leave a heading that bounds future cycles",
    "input": "{\"instructions\":\"GGRGGLLGRGGLG\"}"
  },
  {
    "label": "Returns to origin facing the original direction",
    "input": "{\"instructions\":\"GGRRGGRR\"}"
  },
  {
    "label": "Northward displacement repeats forever",
    "input": "{\"instructions\":\"GGGLRGG\"}"
  },
  {
    "label": "Turns without moving stay at the origin",
    "input": "{\"instructions\":\"RRR\"}"
  }
];
