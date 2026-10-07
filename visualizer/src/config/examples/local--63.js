// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several detours",
    "m": 4,
    "n": 6,
    "obstacleGrid": [
      [
        0,
        0,
        0,
        0,
        0,
        0
      ],
      [
        0,
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
        1,
        0
      ],
      [
        0,
        1,
        0,
        0,
        0,
        0
      ]
    ]
  },
  {
    "label": "Blocked start",
    "m": 2,
    "n": 3,
    "obstacleGrid": [
      [
        1,
        0,
        0
      ],
      [
        0,
        0,
        0
      ]
    ]
  },
  {
    "label": "Blocked end",
    "m": 2,
    "n": 3,
    "obstacleGrid": [
      [
        0,
        0,
        0
      ],
      [
        0,
        0,
        1
      ]
    ]
  },
  {
    "label": "Single blocked corridor",
    "m": 1,
    "n": 5,
    "obstacleGrid": [
      [
        0,
        0,
        1,
        0,
        0
      ]
    ]
  },
  {
    "label": "Open single cell",
    "m": 1,
    "n": 1,
    "obstacleGrid": [
      [
        0
      ]
    ]
  }
];
