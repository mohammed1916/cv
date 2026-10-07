// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Small absorptions grow enough mass for much larger arrivals",
    "input": "{\"mass\":6,\"asteroids\":[34,3,18,7,2,11,55,4]}"
  },
  {
    "label": "Even the smallest arrival is too heavy",
    "input": "{\"mass\":3,\"asteroids\":[9,5,12]}"
  },
  {
    "label": "Equal mass can be absorbed",
    "input": "{\"mass\":8,\"asteroids\":[8]}"
  },
  {
    "label": "A later gap remains too large after small absorptions",
    "input": "{\"mass\":2,\"asteroids\":[1,2,3,40]}"
  }
];
