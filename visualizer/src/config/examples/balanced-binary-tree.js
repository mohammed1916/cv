// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Balanced several levels",
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
    "label": "Deep imbalance away from root",
    "arr": [
      8,
      4,
      12,
      2,
      null,
      10,
      14,
      1,
      null,
      null,
      null,
      null,
      null,
      0
    ]
  },
  {
    "label": "One-sided chain",
    "arr": [
      19,
      14,
      null,
      9,
      null,
      4
    ]
  },
  {
    "label": "Single node",
    "arr": [
      17
    ]
  },
  {
    "label": "Empty tree",
    "arr": []
  },
  {
    "label": "Equal values stay balanced",
    "arr": [
      1,
      1,
      1,
      1,
      1,
      1,
      1
    ]
  },
  {
    "label": "Boundary values with a far leaf",
    "arr": [
      100,
      -100,
      100,
      null,
      null,
      null,
      -100
    ]
  },
  {
    "label": "Long run: 15 values",
    "arr": [
      28,
      100,
      -9,
      -67,
      -15,
      40,
      53,
      6,
      3,
      77,
      -19,
      86,
      44,
      25,
      24
    ]
  }
];
