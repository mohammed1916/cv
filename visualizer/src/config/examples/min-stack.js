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
  },
  {
    "label": "Single push and read",
    "ops": [
      {
        "type": "push",
        "val": -7
      },
      {
        "type": "getMin"
      },
      {
        "type": "top"
      }
    ]
  },
  {
    "label": "Equal minima pop in order",
    "ops": [
      {
        "type": "push",
        "val": 4
      },
      {
        "type": "push",
        "val": 4
      },
      {
        "type": "push",
        "val": 4
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
        "type": "pop"
      },
      {
        "type": "getMin"
      }
    ]
  },
  {
    "label": "Extreme values at the limits",
    "ops": [
      {
        "type": "push",
        "val": 100
      },
      {
        "type": "push",
        "val": -100
      },
      {
        "type": "getMin"
      },
      {
        "type": "push",
        "val": 100
      },
      {
        "type": "top"
      },
      {
        "type": "pop"
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
    "label": "Long run: 28 operations",
    "ops": [
      {
        "type": "push",
        "val": 59
      },
      {
        "type": "push",
        "val": 56
      },
      {
        "type": "top"
      },
      {
        "type": "push",
        "val": 5
      },
      {
        "type": "push",
        "val": -96
      },
      {
        "type": "push",
        "val": 41
      },
      {
        "type": "push",
        "val": -48
      },
      {
        "type": "pop"
      },
      {
        "type": "getMin"
      },
      {
        "type": "push",
        "val": 24
      },
      {
        "type": "getMin"
      },
      {
        "type": "pop"
      },
      {
        "type": "pop"
      },
      {
        "type": "push",
        "val": -12
      },
      {
        "type": "push",
        "val": 45
      },
      {
        "type": "getMin"
      },
      {
        "type": "push",
        "val": -91
      },
      {
        "type": "push",
        "val": 97
      },
      {
        "type": "getMin"
      },
      {
        "type": "pop"
      },
      {
        "type": "push",
        "val": 62
      },
      {
        "type": "push",
        "val": 5
      },
      {
        "type": "getMin"
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
        "type": "top"
      },
      {
        "type": "pop"
      }
    ]
  }
];
