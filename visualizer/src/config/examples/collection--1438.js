// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Window extrema expire at different times",
    "input": "{\"nums\":[8,3,5,6,2,4,7,9,6,5,8],\"limit\":4}"
  },
  {
    "label": "Equal values fit a zero limit",
    "input": "{\"nums\":[7,7,7,2,2],\"limit\":0}"
  },
  {
    "label": "Limit covers every value difference",
    "input": "{\"nums\":[3,11,6,8],\"limit\":20}"
  },
  {
    "label": "Single value always fits",
    "input": "{\"nums\":[19],\"limit\":0}"
  }
];
