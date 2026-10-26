// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several competing island sizes",
    "grid": [
      [
        1,
        1,
        0,
        0,
        1,
        0
      ],
      [
        1,
        0,
        0,
        1,
        1,
        0
      ],
      [
        0,
        0,
        1,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        0,
        1,
        1
      ],
      [
        0,
        1,
        0,
        0,
        0,
        0
      ]
    ],
    "gridStr": "[[1,1,0,0,1,0],[1,0,0,1,1,0],[0,0,1,0,0,1],[1,1,1,0,1,1],[0,1,0,0,0,0]]"
  },
  {
    "label": "All water",
    "grid": [
      [
        0,
        0,
        0
      ],
      [
        0,
        0,
        0
      ]
    ],
    "gridStr": "[[0,0,0],[0,0,0]]"
  },
  {
    "label": "One solid island",
    "grid": [
      [
        1,
        1,
        1
      ],
      [
        1,
        1,
        1
      ]
    ],
    "gridStr": "[[1,1,1],[1,1,1]]"
  },
  {
    "label": "Diagonals stay separate",
    "grid": [
      [
        1,
        0,
        1
      ],
      [
        0,
        1,
        0
      ],
      [
        1,
        0,
        1
      ]
    ],
    "gridStr": "[[1,0,1],[0,1,0],[1,0,1]]"
  },
  {
    "label": "Single land cell",
    "grid": [
      [
        1
      ]
    ],
    "gridStr": "[[1]]"
  }
];
