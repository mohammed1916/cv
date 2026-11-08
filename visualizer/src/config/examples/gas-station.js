// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Failures before a feasible start",
    "gas": [
      2,
      7,
      1,
      6,
      3,
      9,
      2,
      5
    ],
    "cost": [
      5,
      3,
      4,
      5,
      6,
      2,
      4,
      3
    ]
  },
  {
    "label": "Total fuel too small",
    "gas": [
      2,
      3,
      1,
      4
    ],
    "cost": [
      3,
      4,
      2,
      5
    ]
  },
  {
    "label": "Exactly balanced",
    "gas": [
      4,
      1,
      7,
      2
    ],
    "cost": [
      2,
      5,
      3,
      4
    ]
  },
  {
    "label": "One feasible station",
    "gas": [
      6
    ],
    "cost": [
      4
    ]
  },
  {
    "label": "One impossible station",
    "gas": [
      2
    ],
    "cost": [
      3
    ]
  },
  {
    "label": "Equal gas and cost",
    "gas": [
      4,
      4,
      4
    ],
    "cost": [
      4,
      4,
      4
    ]
  },
  {
    "label": "Single funded station",
    "gas": [
      0,
      100
    ],
    "cost": [
      100,
      0
    ]
  },
  {
    "label": "Long run: 40 stations",
    "gas": [
      1,
      8,
      3,
      1,
      2,
      3,
      9,
      10,
      7,
      5,
      0,
      1,
      1,
      3,
      10,
      1,
      10,
      2,
      9,
      9,
      6,
      2,
      9,
      10,
      6,
      2,
      6,
      1,
      9,
      2,
      10,
      6,
      4,
      4,
      3,
      0,
      5,
      3,
      10,
      2
    ],
    "cost": [
      2,
      7,
      2,
      5,
      4,
      8,
      6,
      2,
      0,
      2,
      7,
      0,
      2,
      9,
      0,
      4,
      10,
      8,
      10,
      1,
      1,
      10,
      8,
      10,
      9,
      7,
      8,
      7,
      9,
      3,
      1,
      10,
      9,
      1,
      2,
      4,
      6,
      10,
      1,
      8
    ]
  }
];
