// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Grow turn and follow the tail",
    "width": 5,
    "height": 4,
    "food": [
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
        2
      ],
      [
        2,
        2
      ],
      [
        2,
        1
      ]
    ],
    "commands": [
      "R",
      "R",
      "D",
      "D",
      "L",
      "U",
      "L",
      "D",
      "D",
      "R"
    ],
    "moves": [
      "R",
      "R",
      "D",
      "D",
      "L",
      "U",
      "L",
      "D",
      "D",
      "R"
    ]
  },
  {
    "label": "Wall collision",
    "width": 3,
    "height": 2,
    "food": [],
    "commands": [
      "R",
      "R",
      "R"
    ],
    "moves": [
      "R",
      "R",
      "R"
    ]
  },
  {
    "label": "Food not on the route",
    "width": 4,
    "height": 3,
    "food": [
      [
        2,
        3
      ]
    ],
    "commands": [
      "R",
      "D",
      "L",
      "U"
    ],
    "moves": [
      "R",
      "D",
      "L",
      "U"
    ]
  }
];
