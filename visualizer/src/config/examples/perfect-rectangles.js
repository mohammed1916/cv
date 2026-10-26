// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several tiles make one rectangle",
    "rectangles": [
      [
        0,
        0,
        2,
        3
      ],
      [
        2,
        0,
        5,
        1
      ],
      [
        2,
        1,
        4,
        3
      ],
      [
        4,
        1,
        5,
        3
      ],
      [
        0,
        3,
        5,
        5
      ]
    ]
  },
  {
    "label": "Gap between tiles",
    "rectangles": [
      [
        0,
        0,
        2,
        3
      ],
      [
        3,
        0,
        5,
        3
      ]
    ]
  },
  {
    "label": "Overlapping tiles",
    "rectangles": [
      [
        0,
        0,
        3,
        3
      ],
      [
        2,
        0,
        5,
        3
      ]
    ]
  },
  {
    "label": "One rectangle",
    "rectangles": [
      [
        2,
        4,
        7,
        9
      ]
    ]
  }
];
