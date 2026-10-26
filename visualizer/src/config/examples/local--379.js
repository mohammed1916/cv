// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Exhaust release and reuse",
    "maxNumbers": 3,
    "operations": [
      {
        "type": "get"
      },
      {
        "type": "get"
      },
      {
        "type": "get"
      },
      {
        "type": "get"
      },
      {
        "type": "release",
        "number": 1
      },
      {
        "type": "check",
        "number": 1
      },
      {
        "type": "get"
      },
      {
        "type": "check",
        "number": 1
      }
    ]
  },
  {
    "label": "Duplicate release",
    "maxNumbers": 2,
    "operations": [
      {
        "type": "get"
      },
      {
        "type": "release",
        "number": 0
      },
      {
        "type": "release",
        "number": 0
      },
      {
        "type": "get"
      },
      {
        "type": "get"
      }
    ]
  },
  {
    "label": "One number",
    "maxNumbers": 1,
    "operations": [
      {
        "type": "get"
      },
      {
        "type": "check",
        "number": 0
      },
      {
        "type": "get"
      }
    ]
  }
];
