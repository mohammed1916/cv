// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A middle run occupies more than a quarter",
    "input": "{\"arr\":[1,2,3,7,7,7,7,8,9,10,11,12]}"
  },
  {
    "label": "One value array",
    "input": "{\"arr\":[6]}"
  },
  {
    "label": "The large run starts at zero",
    "input": "{\"arr\":[2,2,2,4,5,6,7,8]}"
  },
  {
    "label": "The large run ends at the final index",
    "input": "{\"arr\":[1,3,5,8,9,9,9,9]}"
  }
];
