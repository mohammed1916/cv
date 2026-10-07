// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Turns and stopping points",
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
    "start": [
      0,
      0
    ],
    "destination": [
      4,
      4
    ]
  },
  {
    "label": "Pass-through is not a stop",
    "maze": [
      [
        0,
        0,
        0,
        0,
        0
      ]
    ],
    "start": [
      0,
      0
    ],
    "destination": [
      0,
      2
    ]
  },
  {
    "label": "Disconnected rooms",
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
    "start": [
      0,
      0
    ],
    "destination": [
      2,
      2
    ]
  },
  {
    "label": "Already at destination",
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
    "start": [
      0,
      0
    ],
    "destination": [
      0,
      0
    ]
  }
];
