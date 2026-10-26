// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicates absent removals and slot swaps",
    "operations": [
      {
        "type": "insert",
        "val": 7
      },
      {
        "type": "insert",
        "val": 12
      },
      {
        "type": "insert",
        "val": 7
      },
      {
        "type": "insert",
        "val": 19
      },
      {
        "type": "delete",
        "val": 12
      },
      {
        "type": "delete",
        "val": 99
      },
      {
        "type": "getRandom"
      }
    ]
  },
  {
    "label": "Drain then reuse",
    "operations": [
      {
        "type": "insert",
        "val": 8
      },
      {
        "type": "delete",
        "val": 8
      },
      {
        "type": "insert",
        "val": 17
      },
      {
        "type": "getRandom"
      }
    ]
  },
  {
    "label": "One member",
    "operations": [
      {
        "type": "insert",
        "val": 23
      },
      {
        "type": "getRandom"
      }
    ]
  }
];
