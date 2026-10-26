// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Later relaxation improves an earlier route",
    "n": 6,
    "k": 1,
    "times": [
      [
        1,
        2,
        8
      ],
      [
        1,
        3,
        2
      ],
      [
        3,
        2,
        3
      ],
      [
        2,
        4,
        2
      ],
      [
        3,
        5,
        7
      ],
      [
        4,
        5,
        1
      ],
      [
        5,
        6,
        4
      ],
      [
        1,
        6,
        20
      ]
    ]
  },
  {
    "label": "Unreachable node",
    "n": 4,
    "k": 1,
    "times": [
      [
        1,
        2,
        3
      ],
      [
        2,
        3,
        4
      ]
    ]
  },
  {
    "label": "Cycle",
    "n": 3,
    "k": 2,
    "times": [
      [
        2,
        1,
        4
      ],
      [
        1,
        3,
        2
      ],
      [
        3,
        2,
        1
      ]
    ]
  },
  {
    "label": "One node",
    "n": 1,
    "k": 1,
    "times": []
  }
];
