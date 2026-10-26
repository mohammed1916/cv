// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Updates affect several rectangles",
    "matrix": [
      [
        3,
        8,
        1,
        7
      ],
      [
        4,
        -2,
        9,
        5
      ],
      [
        6,
        0,
        2,
        11
      ]
    ],
    "operations": [
      {
        "type": "sumRegion",
        "row1": 0,
        "col1": 1,
        "row2": 2,
        "col2": 3
      },
      {
        "type": "update",
        "row": 1,
        "col": 2,
        "value": -4
      },
      {
        "type": "sumRegion",
        "row1": 1,
        "col1": 0,
        "row2": 2,
        "col2": 2
      },
      {
        "type": "update",
        "row": 0,
        "col": 0,
        "value": 13
      },
      {
        "type": "sumRegion",
        "row1": 0,
        "col1": 0,
        "row2": 2,
        "col2": 3
      }
    ]
  },
  {
    "label": "Single cell",
    "matrix": [
      [
        7
      ]
    ],
    "operations": [
      {
        "type": "update",
        "row": 0,
        "col": 0,
        "value": -2
      },
      {
        "type": "sumRegion",
        "row1": 0,
        "col1": 0,
        "row2": 0,
        "col2": 0
      }
    ]
  },
  {
    "label": "Unchanged update and full rectangle",
    "matrix": [
      [
        2,
        5
      ],
      [
        8,
        11
      ]
    ],
    "operations": [
      {
        "type": "update",
        "row": 0,
        "col": 1,
        "value": 5
      },
      {
        "type": "sumRegion",
        "row1": 0,
        "col1": 0,
        "row2": 1,
        "col2": 1
      }
    ]
  }
];
