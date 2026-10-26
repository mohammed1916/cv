// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Forward cycle inside a longer array",
    "nums": [
      2,
      3,
      1,
      2,
      2,
      1,
      3
    ]
  },
  {
    "label": "Mixed directions invalidate loop",
    "nums": [
      1,
      -1,
      2,
      -2
    ]
  },
  {
    "label": "Self-loop excluded",
    "nums": [
      4,
      4,
      4,
      4
    ]
  },
  {
    "label": "Backward cycle",
    "nums": [
      -2,
      -2,
      -2,
      -2,
      -2
    ]
  }
];
