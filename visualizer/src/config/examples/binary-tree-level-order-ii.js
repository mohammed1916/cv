// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several levels and branches",
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
    "root": [
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
    ],
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
    "root": [
      19,
      14,
      null,
      9,
      null,
      4
    ],
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
    "root": [
      23
    ],
    "arr": [
      23
    ]
  },
  {
    "label": "Empty tree",
    "root": [],
    "arr": []
  },
  {
    "label": "Equal values on every level",
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
    "label": "Boundary values at the limit",
    "arr": [
      1000,
      -1000,
      null,
      -1000
    ]
  },
  {
    "label": "Long run: 15 values",
    "arr": [
      144,
      -444,
      202,
      853,
      -859,
      -496,
      -245,
      214,
      233,
      602,
      -91,
      -940,
      -172,
      -682,
      -338
    ]
  }
];
