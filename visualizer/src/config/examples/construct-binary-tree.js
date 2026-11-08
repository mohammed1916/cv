// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several recursive subtrees",
    "pre": [
      18,
      7,
      3,
      12,
      29,
      24,
      35
    ],
    "ino": [
      3,
      7,
      12,
      18,
      24,
      29,
      35
    ]
  },
  {
    "label": "Right-only chain",
    "pre": [
      4,
      9,
      15,
      22
    ],
    "ino": [
      4,
      9,
      15,
      22
    ]
  },
  {
    "label": "Left-only chain",
    "pre": [
      22,
      15,
      9,
      4
    ],
    "ino": [
      4,
      9,
      15,
      22
    ]
  },
  {
    "label": "Singleton",
    "pre": [
      17
    ],
    "ino": [
      17
    ]
  },
  {
    "label": "Smallest tree",
    "pre": [
      7
    ],
    "ino": [
      7
    ]
  },
  {
    "label": "Negative and large values",
    "pre": [
      -5,
      10000,
      3
    ],
    "ino": [
      10000,
      -5,
      3
    ]
  },
  {
    "label": "Long run: 20 nodes",
    "pre": [
      6,
      1,
      19,
      12,
      4,
      18,
      20,
      9,
      15,
      8,
      3,
      13,
      2,
      5,
      10,
      11,
      17,
      7,
      16,
      14
    ],
    "ino": [
      12,
      4,
      19,
      18,
      1,
      15,
      8,
      9,
      20,
      3,
      6,
      13,
      5,
      2,
      10,
      17,
      7,
      11,
      14,
      16
    ]
  }
];
