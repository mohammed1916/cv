// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved writes and removals",
    "input": [
      [
        "push",
        4
      ],
      [
        "push",
        8
      ],
      [
        "peek"
      ],
      [
        "pop"
      ],
      [
        "push",
        12
      ],
      [
        "push",
        16
      ],
      [
        "pop"
      ],
      [
        "peek"
      ],
      [
        "empty"
      ]
    ]
  },
  {
    "label": "Drain and reuse",
    "input": [
      [
        "push",
        7
      ],
      [
        "pop"
      ],
      [
        "empty"
      ],
      [
        "push",
        19
      ],
      [
        "peek"
      ]
    ]
  },
  {
    "label": "Initially empty",
    "input": [
      [
        "empty"
      ]
    ]
  }
];
