// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different product types require separately rounded store counts",
    "input": "{\"n\":14,\"quantities\":[23,17,41,8,29,12]}"
  },
  {
    "label": "One store per type forces the largest quantity",
    "input": "{\"n\":4,\"quantities\":[9,24,15,6]}"
  },
  {
    "label": "Enough stores allow one product per store",
    "input": "{\"n\":20,\"quantities\":[3,5,4]}"
  },
  {
    "label": "One product type is split across many stores",
    "input": "{\"n\":7,\"quantities\":[38]}"
  }
];
