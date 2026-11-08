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
  },
  {
    "label": "Full range covered except the interior",
    "nums": [
      -100,
      100
    ],
    "lower": -100,
    "upper": 100
  },
  {
    "label": "Boundary value present, both ends missing",
    "nums": [
      0
    ],
    "lower": -100,
    "upper": 100
  },
  {
    "label": "Adjacent numbers leave nothing missing",
    "nums": [
      1,
      2,
      3
    ],
    "lower": 1,
    "upper": 3
  },
  {
    "label": "Long run: 20 numbers",
    "nums": [
      -92,
      -87,
      -84,
      -83,
      -82,
      -78,
      -74,
      -72,
      -67,
      -59,
      -58,
      -46,
      -40,
      -39,
      -37,
      -33,
      -29,
      -27,
      -26,
      -22
    ],
    "lower": -100,
    "upper": 100
  }
];
