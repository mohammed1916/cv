// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Three buildings and obstacles",
    "grid": [
      [
        1,
        0,
        0,
        2,
        0
      ],
      [
        0,
        0,
        0,
        0,
        1
      ],
      [
        0,
        2,
        0,
        0,
        0
      ],
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
    "label": "No common reachable land",
    "grid": [
      [
        1,
        2,
        0
      ],
      [
        2,
        2,
        2
      ],
      [
        0,
        2,
        1
      ]
    ]
  },
  {
    "label": "One building",
    "grid": [
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
    "label": "No empty land",
    "grid": [
      [
        1,
        1
      ],
      [
        1,
        1
      ]
    ]
  }
];
