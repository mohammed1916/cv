// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Matching rows with qualified columns",
    "picture": [
      [
        "B",
        "W",
        "B",
        "W",
        "W"
      ],
      [
        "B",
        "W",
        "B",
        "W",
        "W"
      ],
      [
        "W",
        "B",
        "W",
        "B",
        "W"
      ],
      [
        "W",
        "W",
        "W",
        "W",
        "B"
      ]
    ],
    "N": 2
  },
  {
    "label": "No black pixels",
    "picture": [
      [
        "W",
        "W"
      ],
      [
        "W",
        "W"
      ]
    ],
    "N": 1
  },
  {
    "label": "Identical dense rows",
    "picture": [
      [
        "B",
        "B"
      ],
      [
        "B",
        "B"
      ]
    ],
    "N": 2
  },
  {
    "label": "Single black",
    "picture": [
      [
        "B"
      ]
    ],
    "N": 1
  }
];
