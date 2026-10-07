// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Many overlapping ranges",
    "nums": [
      4,
      -6,
      3,
      8,
      -5,
      2,
      -1,
      7
    ],
    "lower": -2,
    "upper": 5
  },
  {
    "label": "Exact zero range",
    "nums": [
      0,
      0,
      0
    ],
    "lower": 0,
    "upper": 0
  },
  {
    "label": "No qualifying range",
    "nums": [
      2,
      5,
      8
    ],
    "lower": 20,
    "upper": 25
  },
  {
    "label": "Negative range",
    "nums": [
      -3,
      -4,
      2,
      -6
    ],
    "lower": -9,
    "upper": -4
  }
];
