// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Chain ratios and disconnected component",
    "equations": [
      [
        "oak",
        "pine"
      ],
      [
        "pine",
        "birch"
      ],
      [
        "birch",
        "cedar"
      ],
      [
        "lake",
        "sea"
      ]
    ],
    "values": [
      2,
      3,
      4,
      5
    ],
    "queries": [
      [
        "oak",
        "cedar"
      ],
      [
        "cedar",
        "oak"
      ],
      [
        "oak",
        "oak"
      ],
      [
        "oak",
        "lake"
      ],
      [
        "mist",
        "mist"
      ]
    ]
  },
  {
    "label": "Reciprocal and identity",
    "equations": [
      [
        "x",
        "y"
      ]
    ],
    "values": [
      7
    ],
    "queries": [
      [
        "y",
        "x"
      ],
      [
        "x",
        "x"
      ],
      [
        "y",
        "z"
      ]
    ]
  },
  {
    "label": "Fractional ratios",
    "equations": [
      [
        "a",
        "b"
      ],
      [
        "b",
        "c"
      ]
    ],
    "values": [
      0.5,
      0.25
    ],
    "queries": [
      [
        "a",
        "c"
      ],
      [
        "c",
        "a"
      ]
    ]
  }
];
