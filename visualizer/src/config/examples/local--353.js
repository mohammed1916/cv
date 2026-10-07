// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved trips on several routes",
    "events": [
      {
        "type": "checkIn",
        "id": 11,
        "stationName": "Pine",
        "t": 2
      },
      {
        "type": "checkIn",
        "id": 12,
        "stationName": "Pine",
        "t": 4
      },
      {
        "type": "checkOut",
        "id": 11,
        "stationName": "River",
        "t": 14
      },
      {
        "type": "checkOut",
        "id": 12,
        "stationName": "River",
        "t": 20
      },
      {
        "type": "checkIn",
        "id": 11,
        "stationName": "River",
        "t": 24
      },
      {
        "type": "checkOut",
        "id": 11,
        "stationName": "Hill",
        "t": 33
      }
    ]
  },
  {
    "label": "One completed journey",
    "events": [
      {
        "type": "checkIn",
        "id": 21,
        "stationName": "Lake",
        "t": 7
      },
      {
        "type": "checkOut",
        "id": 21,
        "stationName": "Garden",
        "t": 26
      }
    ]
  },
  {
    "label": "Journey still active",
    "events": [
      {
        "type": "checkIn",
        "id": 31,
        "stationName": "Harbor",
        "t": 5
      }
    ]
  }
];
