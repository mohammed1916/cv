// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rectangular reshape",
    "mat": [
      [
        2,
        5,
        8,
        11
      ],
      [
        14,
        17,
        20,
        23
      ],
      [
        26,
        29,
        32,
        35
      ]
    ],
    "r": 2,
    "c": 6
  },
  {
    "label": "Incompatible cell count",
    "mat": [
      [
        3,
        7,
        11
      ],
      [
        15,
        19,
        23
      ]
    ],
    "r": 4,
    "c": 2
  },
  {
    "label": "Unchanged shape",
    "mat": [
      [
        4,
        8
      ],
      [
        12,
        16
      ]
    ],
    "r": 2,
    "c": 2
  },
  {
    "label": "Flatten to row",
    "mat": [
      [
        2,
        6
      ],
      [
        10,
        14
      ],
      [
        18,
        22
      ]
    ],
    "r": 1,
    "c": 6
  }
];
