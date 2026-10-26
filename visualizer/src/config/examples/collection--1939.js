// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different users have repeated requests at different gaps",
    "input": "{\"signups\":[{\"user_id\":11,\"time_stamp\":\"2024-02-10 08:00:00\"},{\"user_id\":17,\"time_stamp\":\"2024-02-10 08:00:00\"},{\"user_id\":29,\"time_stamp\":\"2024-02-10 08:00:00\"}],\"confirmations\":[{\"user_id\":11,\"time_stamp\":\"2025-04-03 08:00:00\",\"action\":\"timeout\"},{\"user_id\":29,\"time_stamp\":\"2025-05-01 10:00:00\",\"action\":\"confirmed\"},{\"user_id\":17,\"time_stamp\":\"2025-04-08 12:00:00\",\"action\":\"timeout\"},{\"user_id\":11,\"time_stamp\":\"2025-04-03 13:30:00\",\"action\":\"confirmed\"},{\"user_id\":29,\"time_stamp\":\"2025-05-03 11:00:00\",\"action\":\"timeout\"},{\"user_id\":17,\"time_stamp\":\"2025-04-10 12:00:01\",\"action\":\"confirmed\"},{\"user_id\":11,\"time_stamp\":\"2025-04-04 07:00:00\",\"action\":\"timeout\"},{\"user_id\":29,\"time_stamp\":\"2025-05-03 17:00:00\",\"action\":\"confirmed\"}]}"
  },
  {
    "label": "Exactly one day qualifies regardless of action",
    "input": "{\"signups\":[{\"user_id\":41,\"time_stamp\":\"2024-02-10 08:00:00\"}],\"confirmations\":[{\"user_id\":41,\"time_stamp\":\"2025-06-02 09:15:00\",\"action\":\"confirmed\"},{\"user_id\":41,\"time_stamp\":\"2025-06-03 09:15:00\",\"action\":\"timeout\"}]}"
  },
  {
    "label": "One second beyond a day does not qualify",
    "input": "{\"signups\":[{\"user_id\":43,\"time_stamp\":\"2024-02-10 08:00:00\"}],\"confirmations\":[{\"user_id\":43,\"time_stamp\":\"2025-06-02 09:15:00\",\"action\":\"timeout\"},{\"user_id\":43,\"time_stamp\":\"2025-06-03 09:15:01\",\"action\":\"timeout\"}]}"
  },
  {
    "label": "Registered users with no confirmation requests",
    "input": "{\"signups\":[{\"user_id\":47,\"time_stamp\":\"2024-02-10 08:00:00\"},{\"user_id\":53,\"time_stamp\":\"2024-02-10 08:00:00\"}],\"confirmations\":[]}"
  }
];
