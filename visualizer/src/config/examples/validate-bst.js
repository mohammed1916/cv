// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several valid ancestor bounds",
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
    "label": "Locally valid, globally invalid",
    "arr": [
      20,
      10,
      30,
      5,
      25,
      24,
      35
    ]
  },
  {
    "label": "Duplicate violates strictness",
    "arr": [
      8,
      4,
      12,
      null,
      8
    ]
  },
  {
    "label": "Negative keys",
    "arr": [
      -5,
      -12,
      3,
      -18,
      -8,
      0,
      7
    ]
  },
  {
    "label": "One node",
    "arr": [
      17
    ]
  }
];
