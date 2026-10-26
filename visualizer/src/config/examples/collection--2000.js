// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The first repeated boundary character controls the reversal",
    "input": "{\"word\":\"lanternrivertrail\",\"ch\":\"r\"}"
  },
  {
    "label": "Boundary already at the first character",
    "input": "{\"word\":\"meadow\",\"ch\":\"m\"}"
  },
  {
    "label": "The requested character is absent",
    "input": "{\"word\":\"orchard\",\"ch\":\"z\"}"
  },
  {
    "label": "Boundary at the last character reverses the entire word",
    "input": "{\"word\":\"clouds\",\"ch\":\"s\"}"
  }
];
