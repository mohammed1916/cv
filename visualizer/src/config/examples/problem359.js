// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Independent messages and exact expiry",
    "requests": [
      {
        "timestamp": 2,
        "message": "rain"
      },
      {
        "timestamp": 4,
        "message": "wind"
      },
      {
        "timestamp": 7,
        "message": "rain"
      },
      {
        "timestamp": 11,
        "message": "rain"
      },
      {
        "timestamp": 12,
        "message": "rain"
      },
      {
        "timestamp": 14,
        "message": "wind"
      },
      {
        "timestamp": 22,
        "message": "rain"
      }
    ],
    "threshold": 10
  },
  {
    "label": "Same timestamp",
    "requests": [
      {
        "timestamp": 5,
        "message": "oak"
      },
      {
        "timestamp": 5,
        "message": "oak"
      },
      {
        "timestamp": 5,
        "message": "pine"
      }
    ],
    "threshold": 10
  },
  {
    "label": "Every request expires",
    "requests": [
      {
        "timestamp": 3,
        "message": "moss"
      },
      {
        "timestamp": 8,
        "message": "moss"
      },
      {
        "timestamp": 13,
        "message": "moss"
      }
    ],
    "threshold": 5
  }
];
