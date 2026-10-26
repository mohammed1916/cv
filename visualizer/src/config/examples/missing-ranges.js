// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Missing values and longer gaps",
    "nums": [
      -8,
      -3,
      -2,
      4,
      11,
      18
    ],
    "lower": -12,
    "upper": 23
  },
  {
    "label": "Entire range missing",
    "nums": [],
    "lower": 3,
    "upper": 14
  },
  {
    "label": "No missing values",
    "nums": [
      4,
      5,
      6,
      7
    ],
    "lower": 4,
    "upper": 7
  },
  {
    "label": "Single missing value",
    "nums": [
      2,
      3,
      5,
      6
    ],
    "lower": 2,
    "upper": 6
  }
];
