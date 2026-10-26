// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Bridge several existing intervals",
    "intervals": [
      [
        1,
        3
      ],
      [
        6,
        8
      ],
      [
        11,
        14
      ],
      [
        17,
        20
      ],
      [
        24,
        28
      ]
    ],
    "newInterval": [
      7,
      25
    ]
  },
  {
    "label": "Before all",
    "intervals": [
      [
        5,
        8
      ],
      [
        12,
        16
      ]
    ],
    "newInterval": [
      1,
      3
    ]
  },
  {
    "label": "After all",
    "intervals": [
      [
        2,
        5
      ],
      [
        8,
        11
      ]
    ],
    "newInterval": [
      15,
      19
    ]
  },
  {
    "label": "Contained interval",
    "intervals": [
      [
        2,
        12
      ],
      [
        16,
        20
      ]
    ],
    "newInterval": [
      5,
      8
    ]
  },
  {
    "label": "Empty list",
    "intervals": [],
    "newInterval": [
      4,
      9
    ]
  }
];
