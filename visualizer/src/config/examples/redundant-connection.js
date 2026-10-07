// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Late edge closes a long cycle",
    "edges": [
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ],
      [
        2,
        6
      ],
      [
        6,
        7
      ],
      [
        5,
        7
      ]
    ]
  },
  {
    "label": "Small cycle",
    "edges": [
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ]
  },
  {
    "label": "Cycle with a tail",
    "edges": [
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        2
      ],
      [
        4,
        5
      ]
    ]
  }
];
