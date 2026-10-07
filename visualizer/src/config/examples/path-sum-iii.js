// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Paths may start below root",
    "root": [
      6,
      3,
      -2,
      1,
      5,
      4,
      7,
      2,
      null,
      -1,
      3
    ],
    "targetSum": 6,
    "tree": [
      6,
      3,
      -2,
      1,
      5,
      4,
      7,
      2,
      null,
      -1,
      3
    ],
    "target": 6
  },
  {
    "label": "Many zero paths",
    "root": [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "targetSum": 0,
    "tree": [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "target": 0
  },
  {
    "label": "Negative sums",
    "root": [
      -4,
      -2,
      3,
      -5,
      1,
      -6,
      2
    ],
    "targetSum": -6,
    "tree": [
      -4,
      -2,
      3,
      -5,
      1,
      -6,
      2
    ],
    "target": -6
  },
  {
    "label": "No match",
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
    "targetSum": 999,
    "tree": [
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
    "target": 999
  },
  {
    "label": "Singleton",
    "root": [
      17
    ],
    "targetSum": 17,
    "tree": [
      17
    ],
    "target": 17
  }
];
