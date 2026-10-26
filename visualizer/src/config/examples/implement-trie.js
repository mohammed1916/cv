// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shared prefixes and exact-word distinction",
    "ops": [
      [
        "insert",
        "rain"
      ],
      [
        "insert",
        "rainbow"
      ],
      [
        "insert",
        "river"
      ],
      [
        "search",
        "rai"
      ],
      [
        "startsWith",
        "rai"
      ],
      [
        "search",
        "rain"
      ],
      [
        "insert",
        "rai"
      ],
      [
        "search",
        "rai"
      ],
      [
        "search",
        "road"
      ]
    ]
  },
  {
    "label": "Duplicate insertion",
    "ops": [
      [
        "insert",
        "moss"
      ],
      [
        "insert",
        "moss"
      ],
      [
        "search",
        "moss"
      ],
      [
        "startsWith",
        "mo"
      ]
    ]
  },
  {
    "label": "Missing prefix",
    "ops": [
      [
        "insert",
        "cedar"
      ],
      [
        "startsWith",
        "oak"
      ],
      [
        "search",
        "cedar"
      ]
    ]
  }
];
