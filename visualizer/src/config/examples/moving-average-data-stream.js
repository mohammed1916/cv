// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several evictions change the average",
    "size": 4,
    "stream": [
      12,
      3,
      18,
      -2,
      7,
      21,
      5,
      9,
      16
    ]
  },
  {
    "label": "Window one",
    "size": 1,
    "stream": [
      4,
      9,
      -3,
      12
    ]
  },
  {
    "label": "Stream shorter than window",
    "size": 7,
    "stream": [
      3,
      8,
      13
    ]
  },
  {
    "label": "Zeros and negatives",
    "size": 3,
    "stream": [
      -6,
      0,
      3,
      -9,
      0,
      12
    ]
  }
];
