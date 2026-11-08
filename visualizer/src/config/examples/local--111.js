// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Short leaf competes with deep branch",
    "arr": [
      12,
      5,
      19,
      null,
      null,
      16,
      25,
      14,
      null,
      22,
      28
    ]
  },
  {
    "label": "Missing child is not a leaf",
    "arr": [
      8,
      null,
      13,
      null,
      21,
      null,
      34
    ]
  },
  {
    "label": "Equal leaf depths",
    "arr": [
      18,
      7,
      29,
      3,
      12,
      24,
      35,
      null,
      5,
      10,
      15,
      21,
      null,
      32,
      41
    ]
  },
  {
    "label": "One node",
    "arr": [
      17
    ]
  },
  {
    "label": "Empty",
    "arr": []
  },
  {
    "label": "Boundary values at the limit",
    "arr": [
      1000,
      -1000
    ]
  },
  {
    "label": "Equal leaves at the same depth",
    "arr": [
      2,
      2,
      2,
      2,
      2,
      2,
      2
    ]
  },
  {
    "label": "Long run: 15 values",
    "arr": [
      319,
      809,
      -188,
      162,
      90,
      -636,
      113,
      679,
      634,
      151,
      -883,
      783,
      636,
      -774,
      435
    ]
  }
];
