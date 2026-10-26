// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Walls split enemy sight lines",
    "grid": [
      [
        "0",
        "E",
        "0",
        "0",
        "W",
        "0"
      ],
      [
        "E",
        "0",
        "E",
        "0",
        "E",
        "0"
      ],
      [
        "0",
        "0",
        "W",
        "0",
        "E",
        "0"
      ],
      [
        "E",
        "0",
        "0",
        "0",
        "0",
        "E"
      ]
    ]
  },
  {
    "label": "No enemy",
    "grid": [
      [
        "0",
        "0"
      ],
      [
        "0",
        "0"
      ]
    ]
  },
  {
    "label": "No placement cell",
    "grid": [
      [
        "E",
        "W"
      ],
      [
        "W",
        "E"
      ]
    ]
  },
  {
    "label": "One row",
    "grid": [
      [
        "E",
        "0",
        "E",
        "W",
        "E",
        "0"
      ]
    ]
  }
];
