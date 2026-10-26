// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Low blocked indices remap to high slots",
    "n": 15,
    "blacklist": [
      1,
      3,
      5,
      9,
      12
    ]
  },
  {
    "label": "No blocked index",
    "n": 7,
    "blacklist": []
  },
  {
    "label": "Only one allowed",
    "n": 5,
    "blacklist": [
      0,
      1,
      3,
      4
    ]
  },
  {
    "label": "Only high indices blocked",
    "n": 9,
    "blacklist": [
      6,
      7,
      8
    ]
  }
];
