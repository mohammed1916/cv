// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated minima survive one pop",
    "ops": [
      {
        "type": "push",
        "val": 8
      },
      {
        "type": "push",
        "val": 3
      },
      {
        "type": "push",
        "val": 3
      },
      {
        "type": "getMin"
      },
      {
        "type": "pop"
      },
      {
        "type": "getMin"
      },
      {
        "type": "push",
        "val": -4
      },
      {
        "type": "top"
      },
      {
        "type": "getMin"
      },
      {
        "type": "pop"
      },
      {
        "type": "getMin"
      }
    ]
  },
  {
    "label": "Increasing stack",
    "ops": [
      {
        "type": "push",
        "val": 2
      },
      {
        "type": "push",
        "val": 7
      },
      {
        "type": "push",
        "val": 12
      },
      {
        "type": "getMin"
      },
      {
        "type": "pop"
      },
      {
        "type": "top"
      }
    ]
  },
  {
    "label": "Drain and reuse",
    "ops": [
      {
        "type": "push",
        "val": 9
      },
      {
        "type": "pop"
      },
      {
        "type": "push",
        "val": -6
      },
      {
        "type": "getMin"
      }
    ]
  }
];
