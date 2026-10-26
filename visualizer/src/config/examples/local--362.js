// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Hits on both sides of exact expiry",
    "hits": [
      2,
      50,
      101,
      199,
      200,
      201,
      350,
      499,
      500
    ],
    "timestamp": 500,
    "windowSize": 300
  },
  {
    "label": "Repeated timestamp",
    "hits": [
      7,
      7,
      7,
      7
    ],
    "timestamp": 7,
    "windowSize": 300
  },
  {
    "label": "All expired",
    "hits": [
      2,
      8,
      14
    ],
    "timestamp": 400,
    "windowSize": 300
  },
  {
    "label": "No hits",
    "hits": [],
    "timestamp": 30,
    "windowSize": 300
  }
];
