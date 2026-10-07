// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interior target",
    "matrix": [
      [
        3,
        8,
        13,
        18,
        23
      ],
      [
        28,
        33,
        38,
        43,
        48
      ],
      [
        53,
        58,
        63,
        68,
        73
      ],
      [
        78,
        83,
        88,
        93,
        98
      ]
    ],
    "target": 63
  },
  {
    "label": "Missing between neighbors",
    "matrix": [
      [
        3,
        8,
        13,
        18,
        23
      ],
      [
        28,
        33,
        38,
        43,
        48
      ],
      [
        53,
        58,
        63,
        68,
        73
      ],
      [
        78,
        83,
        88,
        93,
        98
      ]
    ],
    "target": 64
  },
  {
    "label": "Below minimum",
    "matrix": [
      [
        3,
        8,
        13,
        18,
        23
      ],
      [
        28,
        33,
        38,
        43,
        48
      ],
      [
        53,
        58,
        63,
        68,
        73
      ],
      [
        78,
        83,
        88,
        93,
        98
      ]
    ],
    "target": -1
  },
  {
    "label": "Above maximum",
    "matrix": [
      [
        3,
        8,
        13,
        18,
        23
      ],
      [
        28,
        33,
        38,
        43,
        48
      ],
      [
        53,
        58,
        63,
        68,
        73
      ],
      [
        78,
        83,
        88,
        93,
        98
      ]
    ],
    "target": 100
  },
  {
    "label": "Single cell",
    "matrix": [
      [
        17
      ]
    ],
    "target": 17
  }
];
