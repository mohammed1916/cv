// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Three mirrored levels",
    "tree": [
      8,
      3,
      3,
      1,
      6,
      6,
      1,
      null,
      2,
      5,
      null,
      null,
      5,
      2
    ]
  },
  {
    "label": "Same values, asymmetric shape",
    "tree": [
      8,
      3,
      3,
      null,
      6,
      null,
      6
    ]
  },
  {
    "label": "Value mismatch",
    "tree": [
      8,
      3,
      3,
      1,
      6,
      7,
      1
    ]
  },
  {
    "label": "One node",
    "tree": [
      17
    ]
  },
  {
    "label": "Empty",
    "tree": []
  },
  {
    "label": "Equal values, broken shape",
    "tree": [
      1,
      2,
      2,
      null,
      3,
      null,
      3
    ]
  },
  {
    "label": "Boundary values at the limit",
    "tree": [
      100,
      -100,
      -100,
      null,
      100,
      100,
      null
    ]
  },
  {
    "label": "Long run: symmetric 15 nodes",
    "tree": [
      1,
      2,
      2,
      3,
      4,
      4,
      3,
      5,
      6,
      6,
      5,
      7,
      8,
      8,
      7
    ]
  }
];
