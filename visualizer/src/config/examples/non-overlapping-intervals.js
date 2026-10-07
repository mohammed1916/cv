// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several competing endings",
    "val": "[[1,5],[2,3],[3,7],[6,9],[8,11],[11,14]]",
    "intervals": [
      [
        1,
        5
      ],
      [
        2,
        3
      ],
      [
        3,
        7
      ],
      [
        6,
        9
      ],
      [
        8,
        11
      ],
      [
        11,
        14
      ]
    ]
  },
  {
    "label": "Touching is allowed",
    "val": "[[1,3],[3,6],[6,10]]",
    "intervals": [
      [
        1,
        3
      ],
      [
        3,
        6
      ],
      [
        6,
        10
      ]
    ]
  },
  {
    "label": "All overlap",
    "val": "[[2,9],[3,8],[4,7]]",
    "intervals": [
      [
        2,
        9
      ],
      [
        3,
        8
      ],
      [
        4,
        7
      ]
    ]
  },
  {
    "label": "One interval",
    "val": "[[4,9]]",
    "intervals": [
      [
        4,
        9
      ]
    ]
  }
];
