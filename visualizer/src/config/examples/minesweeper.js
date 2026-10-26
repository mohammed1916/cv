// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Blank expansion meets numbered frontier",
    "board": [
      [
        "E",
        "E",
        "E",
        "E",
        "E",
        "E"
      ],
      [
        "E",
        "E",
        "M",
        "E",
        "E",
        "E"
      ],
      [
        "E",
        "E",
        "E",
        "E",
        "E",
        "M"
      ],
      [
        "M",
        "E",
        "E",
        "E",
        "E",
        "E"
      ],
      [
        "E",
        "E",
        "E",
        "E",
        "E",
        "E"
      ]
    ],
    "click": [
      0,
      0
    ]
  },
  {
    "label": "Click a mine",
    "board": [
      [
        "E",
        "M"
      ],
      [
        "E",
        "E"
      ]
    ],
    "click": [
      0,
      1
    ]
  },
  {
    "label": "Adjacent count",
    "board": [
      [
        "M",
        "E",
        "M"
      ],
      [
        "E",
        "E",
        "E"
      ]
    ],
    "click": [
      1,
      1
    ]
  },
  {
    "label": "No mines",
    "board": [
      [
        "E",
        "E",
        "E"
      ],
      [
        "E",
        "E",
        "E"
      ]
    ],
    "click": [
      0,
      1
    ]
  }
];
