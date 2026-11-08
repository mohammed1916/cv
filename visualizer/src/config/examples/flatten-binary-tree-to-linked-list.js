// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several levels and branches",
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
    "label": "Uneven missing children",
    "arr": [
      18,
      7,
      29,
      null,
      12,
      24,
      null,
      10,
      null,
      null,
      26
    ]
  },
  {
    "label": "Only left children",
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
    "label": "One node",
    "arr": [
      23
    ]
  },
  {
    "label": "Empty tree",
    "arr": []
  },
  {
    "label": "Equal values flatten in order",
    "arr": [
      3,
      3,
      3,
      3,
      3
    ]
  },
  {
    "label": "Boundary values at the limit",
    "arr": [
      100,
      -100,
      100,
      null,
      null,
      -100,
      100
    ]
  },
  {
    "label": "Long run: 15 values",
    "arr": [
      45,
      25,
      -48,
      65,
      80,
      26,
      89,
      53,
      44,
      31,
      -98,
      58,
      -76,
      16,
      -99
    ]
  }
];
