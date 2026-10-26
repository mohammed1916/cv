// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nearby values in sliding buckets",
    "nums": [
      4,
      12,
      7,
      19,
      9,
      24,
      15
    ],
    "k": 3,
    "t": 2
  },
  {
    "label": "Equal at exact distance",
    "nums": [
      8,
      3,
      12,
      8
    ],
    "k": 3,
    "t": 0
  },
  {
    "label": "Value difference too large",
    "nums": [
      2,
      9,
      16,
      23
    ],
    "k": 2,
    "t": 3
  },
  {
    "label": "No allowed distance",
    "nums": [
      5,
      5
    ],
    "k": 0,
    "t": 0
  }
];
