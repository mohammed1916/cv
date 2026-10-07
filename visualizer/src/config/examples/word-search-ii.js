// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shared prefixes and intersecting paths",
    "board": [
      [
        "p",
        "i",
        "n",
        "e"
      ],
      [
        "a",
        "x",
        "a",
        "r"
      ],
      [
        "t",
        "h",
        "i",
        "v"
      ],
      [
        "m",
        "o",
        "s",
        "s"
      ]
    ],
    "words": [
      "pine",
      "pin",
      "path",
      "moss",
      "river",
      "oak"
    ]
  },
  {
    "label": "No dictionary word",
    "board": [
      [
        "q",
        "r"
      ],
      [
        "s",
        "t"
      ]
    ],
    "words": [
      "oak",
      "pine"
    ]
  },
  {
    "label": "Same word has several paths",
    "board": [
      [
        "a",
        "a"
      ],
      [
        "a",
        "a"
      ]
    ],
    "words": [
      "a",
      "aa",
      "aaa",
      "aaaa"
    ]
  },
  {
    "label": "Single cell",
    "board": [
      [
        "z"
      ]
    ],
    "words": [
      "z",
      "zz"
    ]
  }
];
