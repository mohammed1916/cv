// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicate slots and removal swaps",
    "ops": [
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
        "type": "remove",
        "val": 12
      },
      {
        "type": "insert",
        "val": 19
      },
      {
        "type": "remove",
        "val": 7
      },
      {
        "type": "getRandom"
      },
      {
        "type": "remove",
        "val": 99
      },
      {
        "type": "getRandom"
      }
    ]
  },
  {
    "label": "One value with duplicates",
    "ops": [
      {
        "type": "insert",
        "val": 5
      },
      {
        "type": "insert",
        "val": 5
      },
      {
        "type": "remove",
        "val": 5
      },
      {
        "type": "getRandom"
      }
    ]
  },
  {
    "label": "Drain then reinsert",
    "ops": [
      {
        "type": "insert",
        "val": 8
      },
      {
        "type": "remove",
        "val": 8
      },
      {
        "type": "insert",
        "val": 14
      },
      {
        "type": "getRandom"
      }
    ]
  }
];
