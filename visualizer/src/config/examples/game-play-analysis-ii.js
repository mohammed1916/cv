// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unsorted dates and device changes",
    "activity": [
      {
        "player_id": 11,
        "device_id": 21,
        "event_date": "2025-03-12",
        "games_played": 4
      },
      {
        "player_id": 12,
        "device_id": 22,
        "event_date": "2025-03-11",
        "games_played": 0
      },
      {
        "player_id": 11,
        "device_id": 23,
        "event_date": "2025-03-13",
        "games_played": 7
      },
      {
        "player_id": 13,
        "device_id": 24,
        "event_date": "2025-03-10",
        "games_played": 3
      },
      {
        "player_id": 12,
        "device_id": 22,
        "event_date": "2025-03-15",
        "games_played": 6
      },
      {
        "player_id": 13,
        "device_id": 25,
        "event_date": "2025-03-11",
        "games_played": 8
      }
    ]
  },
  {
    "label": "One login per player",
    "activity": [
      {
        "player_id": 11,
        "device_id": 21,
        "event_date": "2025-03-12",
        "games_played": 4
      },
      {
        "player_id": 12,
        "device_id": 22,
        "event_date": "2025-03-11",
        "games_played": 0
      },
      {
        "player_id": 13,
        "device_id": 24,
        "event_date": "2025-03-10",
        "games_played": 3
      }
    ]
  },
  {
    "label": "One player several days",
    "activity": [
      {
        "player_id": 11,
        "device_id": 21,
        "event_date": "2025-03-12",
        "games_played": 4
      },
      {
        "player_id": 11,
        "device_id": 23,
        "event_date": "2025-03-13",
        "games_played": 7
      }
    ]
  },
  {
    "label": "Empty activity",
    "activity": []
  }
];
