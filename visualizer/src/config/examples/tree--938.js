// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Range crosses the root and several branches",
    "input": "{\"root\":[24,11,38,5,17,31,46,2,8,14,20,28,34,42,51],\"low\":8,\"high\":34}"
  },
  {
    "label": "Inclusive endpoints",
    "input": "{\"root\":[10,4,16,2,7,13,19],\"low\":4,\"high\":13}"
  },
  {
    "label": "No value in range",
    "input": "{\"root\":[8,3,12],\"low\":20,\"high\":25}"
  },
  {
    "label": "Single exact match",
    "input": "{\"root\":[9],\"low\":9,\"high\":9}"
  }
];
