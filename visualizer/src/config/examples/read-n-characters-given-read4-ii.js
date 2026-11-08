// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Reuse leftovers across calls",
    "file": "lanterns_by_the_river",
    "calls": [
      3,
      2,
      6,
      1,
      9,
      4
    ]
  },
  {
    "label": "After end",
    "file": "cedar",
    "calls": [
      4,
      4,
      2
    ]
  },
  {
    "label": "Zero-length request",
    "file": "pinewood",
    "calls": [
      0,
      3,
      0,
      5
    ]
  },
  {
    "label": "Empty file",
    "file": "",
    "calls": [
      1,
      4
    ]
  },
  {
    "label": "One call on one character",
    "file": "x",
    "calls": [
      1
    ]
  },
  {
    "label": "Every call asks for ten",
    "file": "tidewater",
    "calls": [
      10,
      10,
      10,
      10,
      10,
      10,
      10,
      10
    ]
  },
  {
    "label": "Longest allowed file name",
    "file": "abcdefghijklmnopqrstuvwxyzabcdefghijklmn",
    "calls": [
      3,
      7,
      2,
      9,
      1,
      8,
      4,
      6
    ]
  },
  {
    "label": "Long run: eight calls on a generated file",
    "file": "rncadwxixergobgfsqtiqtdsvsrvdzgidqgbcnjl",
    "calls": [
      8,
      6,
      8,
      7,
      9,
      5,
      8,
      8
    ]
  }
];
