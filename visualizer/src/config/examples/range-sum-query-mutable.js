// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Updates change overlapping queries",
    "nums": [
      4,
      -7,
      12,
      3,
      -2,
      9,
      5,
      -6
    ],
    "operations": [
      {
        "type": "sumRange",
        "left": 1,
        "right": 6
      },
      {
        "type": "update",
        "index": 3,
        "value": 17
      },
      {
        "type": "sumRange",
        "left": 2,
        "right": 5
      },
      {
        "type": "update",
        "index": 0,
        "value": -8
      },
      {
        "type": "sumRange",
        "left": 0,
        "right": 7
      }
    ]
  },
  {
    "label": "Single cell update",
    "nums": [
      13
    ],
    "operations": [
      {
        "type": "sumRange",
        "left": 0,
        "right": 0
      },
      {
        "type": "update",
        "index": 0,
        "value": -4
      },
      {
        "type": "sumRange",
        "left": 0,
        "right": 0
      }
    ]
  },
  {
    "label": "Repeated update",
    "nums": [
      2,
      6,
      10
    ],
    "operations": [
      {
        "type": "update",
        "index": 1,
        "value": 8
      },
      {
        "type": "update",
        "index": 1,
        "value": 3
      },
      {
        "type": "sumRange",
        "left": 0,
        "right": 2
      }
    ]
  }
];
