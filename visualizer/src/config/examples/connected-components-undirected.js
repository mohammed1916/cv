// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several components and a cycle",
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
        0
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
        6,
        7
      ]
    ]
  },
  {
    "label": "All isolated",
    "n": 5,
    "edges": []
  },
  {
    "label": "One connected chain",
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
    "label": "One vertex",
    "n": 1,
    "edges": []
  }
];
