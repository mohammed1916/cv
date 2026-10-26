// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Increasing jumps with alternatives",
    "stones": [
      0,
      1,
      2,
      4,
      7,
      11,
      16,
      22
    ],
    "expected": true
  },
  {
    "label": "Large gap blocks progress",
    "stones": [
      0,
      1,
      3,
      6,
      10,
      20
    ],
    "expected": false
  },
  {
    "label": "First jump unavailable",
    "stones": [
      0,
      2
    ],
    "expected": false
  },
  {
    "label": "Two stones",
    "stones": [
      0,
      1
    ],
    "expected": true
  }
];
