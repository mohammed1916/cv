// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several branches form one tree",
    "input": [
      7,
      [
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          1,
          3
        ],
        [
          1,
          4
        ],
        [
          2,
          5
        ],
        [
          5,
          6
        ]
      ]
    ]
  },
  {
    "label": "Cycle",
    "input": [
      4,
      [
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
          0
        ],
        [
          2,
          3
        ]
      ]
    ]
  },
  {
    "label": "Disconnected",
    "input": [
      5,
      [
        [
          0,
          1
        ],
        [
          1,
          2
        ],
        [
          3,
          4
        ]
      ]
    ]
  },
  {
    "label": "One vertex",
    "input": [
      1,
      []
    ]
  }
];
