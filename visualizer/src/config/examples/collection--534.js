// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved players and unsorted dates need separate running totals",
    "input": "{\"activity\":[{\"player_id\":31,\"device_id\":4,\"event_date\":\"2025-04-08\",\"games_played\":6},{\"player_id\":12,\"device_id\":2,\"event_date\":\"2025-04-03\",\"games_played\":9},{\"player_id\":31,\"device_id\":5,\"event_date\":\"2025-04-02\",\"games_played\":4},{\"player_id\":12,\"device_id\":2,\"event_date\":\"2025-04-07\",\"games_played\":0},{\"player_id\":31,\"device_id\":4,\"event_date\":\"2025-04-05\",\"games_played\":3},{\"player_id\":12,\"device_id\":8,\"event_date\":\"2025-04-01\",\"games_played\":2},{\"player_id\":45,\"device_id\":1,\"event_date\":\"2025-04-09\",\"games_played\":7}]}"
  },
  {
    "label": "Zero-game sessions retain the accumulated total",
    "input": "{\"activity\":[{\"player_id\":7,\"device_id\":2,\"event_date\":\"2025-06-01\",\"games_played\":5},{\"player_id\":7,\"device_id\":3,\"event_date\":\"2025-06-02\",\"games_played\":0},{\"player_id\":7,\"device_id\":2,\"event_date\":\"2025-06-04\",\"games_played\":0}]}"
  },
  {
    "label": "A device change does not start a new player total",
    "input": "{\"activity\":[{\"player_id\":9,\"device_id\":1,\"event_date\":\"2025-01-01\",\"games_played\":3},{\"player_id\":9,\"device_id\":8,\"event_date\":\"2025-01-09\",\"games_played\":8}]}"
  },
  {
    "label": "An empty activity table produces no result rows",
    "input": "{\"activity\":[]}"
  }
];
