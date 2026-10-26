// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Transitive merges and same-name separation",
    "accounts": [
      [
        "Mira",
        "m1@example.org",
        "m2@example.org"
      ],
      [
        "Mira",
        "m3@example.org",
        "m4@example.org"
      ],
      [
        "Mira",
        "m2@example.org",
        "m3@example.org"
      ],
      [
        "Mira",
        "m9@example.org"
      ],
      [
        "Oren",
        "o1@example.org",
        "o2@example.org"
      ]
    ]
  },
  {
    "label": "Repeated email in one account",
    "accounts": [
      [
        "Tara",
        "t1@example.org",
        "t1@example.org"
      ]
    ]
  },
  {
    "label": "Disjoint accounts",
    "accounts": [
      [
        "Ivo",
        "i1@example.org"
      ],
      [
        "Nila",
        "n1@example.org"
      ]
    ]
  }
];
