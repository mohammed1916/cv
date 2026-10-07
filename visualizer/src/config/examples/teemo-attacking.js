// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping and separated attacks",
    "attackTime": [
      2,
      4,
      5,
      11,
      14,
      15,
      22
    ],
    "duration": 4,
    "timeSeries": [
      2,
      4,
      5,
      11,
      14,
      15,
      22
    ]
  },
  {
    "label": "Exact touching",
    "attackTime": [
      1,
      5,
      9
    ],
    "duration": 4,
    "timeSeries": [
      1,
      5,
      9
    ]
  },
  {
    "label": "Single attack",
    "attackTime": [
      7
    ],
    "duration": 6,
    "timeSeries": [
      7
    ]
  },
  {
    "label": "No duration",
    "attackTime": [
      3,
      8,
      12
    ],
    "duration": 0,
    "timeSeries": [
      3,
      8,
      12
    ]
  }
];
