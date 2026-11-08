// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long prefix before entry",
    "nodes": [
      4,
      8,
      12,
      16,
      20,
      24,
      28,
      32,
      36
    ],
    "pos": 4
  },
  {
    "label": "Entry at head",
    "nodes": [
      3,
      7,
      11,
      15,
      19
    ],
    "pos": 0
  },
  {
    "label": "No cycle",
    "nodes": [
      5,
      9,
      13,
      17
    ],
    "pos": -1
  },
  {
    "label": "Self-loop",
    "nodes": [
      23
    ],
    "pos": 0
  },
  {
    "label": "Empty",
    "nodes": [],
    "pos": -1
  },
  {
    "label": "Single node with no cycle",
    "nodes": [
      8
    ],
    "pos": -1
  },
  {
    "label": "Equal values make positions the only difference",
    "nodes": [
      5,
      5,
      5,
      5,
      5
    ],
    "pos": 2
  },
  {
    "label": "Largest visual list with entry at the tail",
    "nodes": [
      23,
      56,
      56,
      2,
      74,
      80,
      83,
      14,
      62,
      54,
      22,
      53,
      94,
      61,
      2,
      31,
      72,
      5,
      43,
      41,
      50,
      97,
      26,
      31,
      71,
      19,
      91,
      49,
      59,
      75,
      6,
      0,
      49,
      18,
      59,
      89,
      69,
      6,
      35,
      48
    ],
    "pos": 39
  },
  {
    "label": "Long run: 24 nodes with entry midway",
    "nodes": [
      25,
      47,
      51,
      43,
      86,
      29,
      62,
      45,
      92,
      23,
      87,
      49,
      4,
      10,
      12,
      61,
      75,
      61,
      51,
      68,
      4,
      75,
      19,
      30
    ],
    "pos": 11
  }
];
