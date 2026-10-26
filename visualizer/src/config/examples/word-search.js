// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Turn several times without reusing cells",
    "board": [
      [
        "R",
        "I",
        "V",
        "E",
        "R"
      ],
      [
        "A",
        "X",
        "X",
        "X",
        "B"
      ],
      [
        "N",
        "X",
        "X",
        "X",
        "A"
      ],
      [
        "S",
        "T",
        "O",
        "N",
        "E"
      ]
    ],
    "word": "RIVERBAENOTS"
  },
  {
    "label": "Would require reusing a cell",
    "board": [
      [
        "A",
        "B"
      ],
      [
        "C",
        "D"
      ]
    ],
    "word": "ABAC"
  },
  {
    "label": "Word absent",
    "board": [
      [
        "M",
        "O",
        "S"
      ],
      [
        "P",
        "I",
        "N"
      ]
    ],
    "word": "OAK"
  },
  {
    "label": "Single cell match",
    "board": [
      [
        "Q"
      ]
    ],
    "word": "Q"
  }
];
