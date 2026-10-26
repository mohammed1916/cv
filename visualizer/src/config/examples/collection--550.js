// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Only returns following each player first login count",
    "input": "{\"activity\":[{\"player_id\":11,\"device_id\":1,\"event_date\":\"2025-08-01\",\"games_played\":2},{\"player_id\":11,\"device_id\":2,\"event_date\":\"2025-08-02\",\"games_played\":0},{\"player_id\":11,\"device_id\":2,\"event_date\":\"2025-08-03\",\"games_played\":4},{\"player_id\":22,\"device_id\":1,\"event_date\":\"2025-08-03\",\"games_played\":3},{\"player_id\":22,\"device_id\":1,\"event_date\":\"2025-08-05\",\"games_played\":5},{\"player_id\":33,\"device_id\":2,\"event_date\":\"2025-08-06\",\"games_played\":1},{\"player_id\":33,\"device_id\":2,\"event_date\":\"2025-08-07\",\"games_played\":6},{\"player_id\":44,\"device_id\":3,\"event_date\":\"2025-08-09\",\"games_played\":2},{\"player_id\":44,\"device_id\":3,\"event_date\":\"2025-08-10\",\"games_played\":3}]}"
  },
  {
    "label": "The next day can cross a leap-year month boundary",
    "input": "{\"activity\":[{\"player_id\":5,\"device_id\":2,\"event_date\":\"2024-02-28\",\"games_played\":0},{\"player_id\":5,\"device_id\":2,\"event_date\":\"2024-02-29\",\"games_played\":0},{\"player_id\":6,\"device_id\":1,\"event_date\":\"2024-02-29\",\"games_played\":1},{\"player_id\":6,\"device_id\":1,\"event_date\":\"2024-03-01\",\"games_played\":2}]}"
  },
  {
    "label": "Later consecutive sessions do not repair a missed first-day return",
    "input": "{\"activity\":[{\"player_id\":8,\"device_id\":1,\"event_date\":\"2025-03-01\",\"games_played\":2},{\"player_id\":8,\"device_id\":1,\"event_date\":\"2025-03-03\",\"games_played\":2},{\"player_id\":8,\"device_id\":1,\"event_date\":\"2025-03-04\",\"games_played\":2}]}"
  },
  {
    "label": "One retained player among three requires rounding",
    "input": "{\"activity\":[{\"player_id\":1,\"device_id\":1,\"event_date\":\"2025-12-31\",\"games_played\":1},{\"player_id\":1,\"device_id\":2,\"event_date\":\"2026-01-01\",\"games_played\":1},{\"player_id\":2,\"device_id\":1,\"event_date\":\"2025-12-31\",\"games_played\":1},{\"player_id\":3,\"device_id\":1,\"event_date\":\"2025-12-31\",\"games_played\":1}]}"
  }
];
