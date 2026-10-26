// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shuffled observations include overlapping lower and higher values",
    "input": "{\"nums\":[24,3,15,26,11,18,6,23,16,14]}"
  },
  {
    "label": "Repeated original values require occurrence counts",
    "input": "{\"nums\":[13,7,13,7,13,7]}"
  },
  {
    "label": "Only two observations recover one midpoint",
    "input": "{\"nums\":[18,10]}"
  },
  {
    "label": "A smaller even candidate fails before the valid pairing",
    "input": "{\"nums\":[1,5,7,9,11,15]}"
  }
];
