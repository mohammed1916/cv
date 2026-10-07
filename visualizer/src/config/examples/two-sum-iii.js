// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated additions and several queries",
    "input": [
      [
        "add",
        4
      ],
      [
        "add",
        9
      ],
      [
        "add",
        4
      ],
      [
        "find",
        8
      ],
      [
        "add",
        15
      ],
      [
        "find",
        24
      ],
      [
        "find",
        30
      ]
    ]
  },
  {
    "label": "Cannot reuse one occurrence",
    "input": [
      [
        "add",
        7
      ],
      [
        "find",
        14
      ]
    ]
  },
  {
    "label": "Negative pair",
    "input": [
      [
        "add",
        -4
      ],
      [
        "add",
        11
      ],
      [
        "find",
        7
      ]
    ]
  }
];
