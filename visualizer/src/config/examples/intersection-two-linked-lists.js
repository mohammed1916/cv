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
  },
  {
    "label": "Single shared node",
    "listA": [],
    "listB": [],
    "shared": [
      9
    ],
    "intersectVal": 9
  },
  {
    "label": "Equal values in different nodes",
    "listA": [
      5,
      5
    ],
    "listB": [
      5,
      5,
      5
    ],
    "shared": [
      5
    ],
    "intersectVal": 5
  },
  {
    "label": "Largest allowed first list",
    "listA": [
      0,
      99,
      0,
      99,
      0,
      99,
      0,
      99,
      0,
      99,
      0,
      99,
      0,
      99,
      0,
      99,
      0,
      99,
      0,
      99
    ],
    "listB": [
      0
    ],
    "shared": [
      99
    ],
    "intersectVal": 99
  },
  {
    "label": "Long run: shared tail of ten nodes",
    "listA": [
      18,
      64,
      73,
      88,
      20,
      14,
      67,
      90
    ],
    "listB": [
      20,
      55,
      68,
      30,
      32,
      62
    ],
    "shared": [
      23,
      46,
      63,
      71,
      44,
      11,
      26,
      52,
      53,
      48
    ],
    "intersectVal": 0
  }
];
