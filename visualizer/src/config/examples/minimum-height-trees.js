// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven branches, iterative leaf trimming",
    "n": 9,
    "edges": [
      [
        0,
        1
      ],
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
        2,
        5
      ],
      [
        5,
        6
      ],
      [
        5,
        7
      ],
      [
        7,
        8
      ]
    ]
  },
  {
    "label": "Two centers",
    "n": 6,
    "edges": [
      [
        0,
        1
      ],
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
      ]
    ]
  },
  {
    "label": "Star center",
    "n": 6,
    "edges": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        0,
        3
      ],
      [
        0,
        4
      ],
      [
        0,
        5
      ]
    ]
  },
  {
    "label": "Single node",
    "n": 1,
    "edges": []
  },
  {
    "label": "Two nodes",
    "n": 2,
    "edges": [
      [
        0,
        1
      ]
    ]
  }
];
