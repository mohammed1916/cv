// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several root-to-leaf routes",
    "root": [
      8,
      4,
      13,
      3,
      7,
      9,
      17,
      2,
      null,
      1,
      5
    ],
    "targetSum": 24
  },
  {
    "label": "No matching leaf",
    "root": [
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
    ],
    "targetSum": 999
  },
  {
    "label": "Internal prefix is insufficient",
    "root": [
      7,
      4,
      9,
      2,
      5
    ],
    "targetSum": 11
  },
  {
    "label": "Negative cancellation",
    "root": [
      4,
      -6,
      8,
      5,
      -2,
      -3,
      1
    ],
    "targetSum": 3
  },
  {
    "label": "Single matching node",
    "root": [
      17
    ],
    "targetSum": 17
  },
  {
    "label": "Empty",
    "root": [],
    "targetSum": 0
  },
  {
    "label": "Equal values give several routes",
    "root": [
      2,
      2,
      2,
      2,
      2,
      2,
      2
    ],
    "targetSum": 6
  },
  {
    "label": "Boundary values at the limit",
    "root": [
      1000,
      -1000,
      1000,
      null,
      null,
      null,
      -1000
    ],
    "targetSum": -1000
  },
  {
    "label": "Long run: 15 values",
    "root": [
      41,
      44,
      -39,
      -18,
      57,
      -71,
      -71,
      -9,
      -17,
      93,
      -28,
      65,
      -97,
      -82,
      82
    ],
    "targetSum": 37
  }
];
