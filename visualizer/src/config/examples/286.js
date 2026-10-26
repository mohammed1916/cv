// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Multiple gates separated by walls",
    "input": [
      [
        [
          2147483647,
          -1,
          0,
          2147483647,
          2147483647
        ],
        [
          2147483647,
          2147483647,
          2147483647,
          -1,
          2147483647
        ],
        [
          2147483647,
          -1,
          2147483647,
          -1,
          2147483647
        ],
        [
          0,
          2147483647,
          2147483647,
          2147483647,
          2147483647
        ]
      ]
    ]
  },
  {
    "label": "No gate",
    "input": [
      [
        [
          2147483647,
          2147483647
        ],
        [
          -1,
          2147483647
        ]
      ]
    ]
  },
  {
    "label": "Only gates",
    "input": [
      [
        [
          0,
          0
        ],
        [
          0,
          0
        ]
      ]
    ]
  },
  {
    "label": "One room beside gate",
    "input": [
      [
        [
          0,
          2147483647
        ]
      ]
    ]
  }
];
