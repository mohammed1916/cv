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
  }
];
