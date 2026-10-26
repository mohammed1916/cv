// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several recursive subtrees",
    "inorder": [
      3,
      7,
      12,
      18,
      24,
      29,
      35
    ],
    "postorder": [
      3,
      12,
      7,
      24,
      35,
      29,
      18
    ]
  },
  {
    "label": "Right-only chain",
    "inorder": [
      4,
      9,
      15,
      22
    ],
    "postorder": [
      22,
      15,
      9,
      4
    ]
  },
  {
    "label": "Left-only chain",
    "inorder": [
      4,
      9,
      15,
      22
    ],
    "postorder": [
      4,
      9,
      15,
      22
    ]
  },
  {
    "label": "Singleton",
    "inorder": [
      17
    ],
    "postorder": [
      17
    ]
  }
];
