// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different prefixes meet late",
    "listA": [
      3,
      7,
      11,
      15
    ],
    "listB": [
      2,
      6
    ],
    "shared": [
      19,
      23,
      27,
      31
    ],
    "intersectVal": 19
  },
  {
    "label": "No shared nodes",
    "listA": [
      4,
      8,
      12
    ],
    "listB": [
      4,
      8,
      12
    ],
    "shared": [],
    "intersectVal": 0
  },
  {
    "label": "Shared from both heads",
    "listA": [],
    "listB": [],
    "shared": [
      5,
      9,
      13
    ],
    "intersectVal": 5
  },
  {
    "label": "One starts at intersection",
    "listA": [],
    "listB": [
      2,
      4,
      6
    ],
    "shared": [
      17,
      21
    ],
    "intersectVal": 17
  }
];
