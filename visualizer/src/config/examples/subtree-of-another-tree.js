// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Exact interior subtree",
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
    "sub": [
      12,
      10,
      15
    ]
  },
  {
    "label": "Same root value, wrong shape",
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
    "sub": [
      12,
      10
    ]
  },
  {
    "label": "Whole tree matches",
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
    "sub": [
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
    "label": "Leaf subtree",
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
    "sub": [
      21
    ]
  },
  {
    "label": "Absent value",
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
    "sub": [
      99
    ]
  }
];
