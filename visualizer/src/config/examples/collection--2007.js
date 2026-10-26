// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Scrambled originals, doubles, and zeroes",
    "input": "{\"changed\":[14,0,6,18,4,7,0,9,12,2,3,6]}"
  },
  {
    "label": "Zero must consume two separate occurrences",
    "input": "{\"changed\":[0,0,0,0]}"
  },
  {
    "label": "A missing double invalidates the whole candidate",
    "input": "{\"changed\":[2,4,5,11]}"
  },
  {
    "label": "Odd length cannot be a doubled array",
    "input": "{\"changed\":[3,6,9]}"
  }
];
