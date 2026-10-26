// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Constraints establish one long ordering",
    "org": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "seqs": [
      [
        1,
        2,
        3
      ],
      [
        2,
        4
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
        5,
        6
      ]
    ]
  },
  {
    "label": "Ambiguous middle",
    "org": [
      1,
      2,
      3,
      4
    ],
    "seqs": [
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        4
      ],
      [
        3,
        4
      ]
    ]
  },
  {
    "label": "Cycle in constraints",
    "org": [
      1,
      2,
      3
    ],
    "seqs": [
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
        1
      ]
    ]
  },
  {
    "label": "Missing vertex",
    "org": [
      1,
      2,
      3,
      4
    ],
    "seqs": [
      [
        1,
        2
      ],
      [
        2,
        3
      ]
    ]
  }
];
