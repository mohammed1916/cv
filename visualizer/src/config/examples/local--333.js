// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One broken ancestor leaves a large BST",
    "inputs": [
      18,
      7,
      29,
      3,
      12,
      10,
      35,
      1,
      5,
      9,
      15
    ]
  },
  {
    "label": "Whole tree is BST",
    "inputs": [
      18,
      7,
      29,
      3,
      12,
      24,
      35,
      null,
      5,
      10,
      15,
      21,
      null,
      32,
      41
    ]
  },
  {
    "label": "Every duplicate breaks strictness",
    "inputs": [
      6,
      6,
      6,
      6,
      6
    ]
  },
  {
    "label": "Singleton",
    "inputs": [
      17
    ]
  }
];
