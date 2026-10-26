// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rows and columns both sorted",
    "matrix": [
      [
        2,
        7,
        12,
        18
      ],
      [
        5,
        9,
        15,
        23
      ],
      [
        8,
        14,
        21,
        28
      ],
      [
        11,
        19,
        26,
        35
      ]
    ],
    "target": 21,
    "input": [
      [
        [
          2,
          7,
          12,
          18
        ],
        [
          5,
          9,
          15,
          23
        ],
        [
          8,
          14,
          21,
          28
        ],
        [
          11,
          19,
          26,
          35
        ]
      ],
      21
    ]
  },
  {
    "label": "Absent interior value",
    "matrix": [
      [
        2,
        7,
        12
      ],
      [
        5,
        9,
        15
      ],
      [
        8,
        14,
        21
      ]
    ],
    "target": 13,
    "input": [
      [
        [
          2,
          7,
          12
        ],
        [
          5,
          9,
          15
        ],
        [
          8,
          14,
          21
        ]
      ],
      13
    ]
  },
  {
    "label": "Smallest",
    "matrix": [
      [
        3,
        8
      ],
      [
        6,
        12
      ]
    ],
    "target": 3,
    "input": [
      [
        [
          3,
          8
        ],
        [
          6,
          12
        ]
      ],
      3
    ]
  },
  {
    "label": "Largest",
    "matrix": [
      [
        3,
        8
      ],
      [
        6,
        12
      ]
    ],
    "target": 12,
    "input": [
      [
        [
          3,
          8
        ],
        [
          6,
          12
        ]
      ],
      12
    ]
  },
  {
    "label": "Single cell",
    "matrix": [
      [
        17
      ]
    ],
    "target": 19,
    "input": [
      [
        [
          17
        ]
      ],
      19
    ]
  }
];
