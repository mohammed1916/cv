// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several rolling routes",
    "maze": [
      [
        0,
        0,
        0,
        1,
        0
      ],
      [
        0,
        1,
        0,
        0,
        0
      ],
      [
        0,
        0,
        0,
        1,
        0
      ],
      [
        1,
        0,
        1,
        0,
        0
      ],
      [
        0,
        0,
        0,
        0,
        0
      ]
    ],
    "ball": [
      0,
      0
    ],
    "hole": [
      4,
      4
    ]
  },
  {
    "label": "Hole stops mid-roll",
    "maze": [
      [
        0,
        0,
        0,
        0,
        0
      ]
    ],
    "ball": [
      0,
      0
    ],
    "hole": [
      0,
      2
    ]
  },
  {
    "label": "Unreachable hole",
    "maze": [
      [
        0,
        1,
        0
      ],
      [
        0,
        1,
        0
      ],
      [
        0,
        1,
        0
      ]
    ],
    "ball": [
      0,
      0
    ],
    "hole": [
      2,
      2
    ]
  },
  {
    "label": "Short roll",
    "maze": [
      [
        0,
        0
      ],
      [
        0,
        0
      ]
    ],
    "ball": [
      1,
      1
    ],
    "hole": [
      0,
      1
    ]
  }
];
