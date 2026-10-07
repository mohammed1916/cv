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
  }
];
