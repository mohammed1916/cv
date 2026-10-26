// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several skipped cookies",
    "greed": [
      2,
      5,
      8,
      3,
      7,
      11
    ],
    "cookies": [
      1,
      3,
      4,
      6,
      8,
      10,
      12
    ],
    "size": [
      1,
      3,
      4,
      6,
      8,
      10,
      12
    ]
  },
  {
    "label": "None fit",
    "greed": [
      5,
      8,
      11
    ],
    "cookies": [
      1,
      2,
      3
    ],
    "size": [
      1,
      2,
      3
    ]
  },
  {
    "label": "More cookies than children",
    "greed": [
      3,
      6
    ],
    "cookies": [
      2,
      3,
      5,
      6,
      9
    ],
    "size": [
      2,
      3,
      5,
      6,
      9
    ]
  },
  {
    "label": "No cookies",
    "greed": [
      2,
      7
    ],
    "cookies": [],
    "size": []
  }
];
