// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Identical sparse trees",
    "p": [
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
    "q": [
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
    "label": "Deep value mismatch",
    "p": [
      8,
      3,
      14,
      1,
      6,
      10,
      19
    ],
    "q": [
      8,
      3,
      14,
      1,
      7,
      10,
      19
    ]
  },
  {
    "label": "Equal values, different shape",
    "p": [
      8,
      3,
      null
    ],
    "q": [
      8,
      null,
      3
    ]
  },
  {
    "label": "Only one empty",
    "p": [],
    "q": [
      17
    ]
  },
  {
    "label": "Both empty",
    "p": [],
    "q": []
  },
  {
    "label": "Equal values, same shape",
    "p": [
      1,
      1,
      1
    ],
    "q": [
      1,
      1,
      1
    ]
  },
  {
    "label": "Boundary values at the limit",
    "p": [
      100,
      -100,
      100
    ],
    "q": [
      100,
      -100,
      100
    ]
  },
  {
    "label": "Long run: 15 entries",
    "p": [
      -16,
      87,
      89,
      -94,
      -52,
      75,
      63,
      -10,
      3,
      90,
      80,
      -46,
      42,
      48,
      31
    ],
    "q": [
      -16,
      87,
      89,
      -94,
      -52,
      75,
      63,
      -10,
      3,
      90,
      80,
      -46,
      42,
      48,
      0
    ]
  }
];
