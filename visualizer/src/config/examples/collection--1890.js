// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Out-of-order logins cross year boundaries",
    "input": "{\"rows\":[{\"user_id\":7,\"time_stamp\":\"2020-03-10 09:20:00\"},{\"user_id\":4,\"time_stamp\":\"2021-01-01 00:00:00\"},{\"user_id\":7,\"time_stamp\":\"2020-12-31 23:59:59\"},{\"user_id\":4,\"time_stamp\":\"2020-07-08 18:30:00\"},{\"user_id\":9,\"time_stamp\":\"2019-12-31 23:59:59\"},{\"user_id\":7,\"time_stamp\":\"2022-06-01 12:00:00\"},{\"user_id\":4,\"time_stamp\":\"2020-02-29 07:00:00\"}]}"
  },
  {
    "label": "Start inclusive and following year exclusive",
    "input": "{\"rows\":[{\"user_id\":1,\"time_stamp\":\"2020-01-01 00:00:00\"},{\"user_id\":1,\"time_stamp\":\"2021-01-01 00:00:00\"}]}"
  },
  {
    "label": "No login in target year",
    "input": "{\"rows\":[{\"user_id\":3,\"time_stamp\":\"2019-08-03 10:00:00\"},{\"user_id\":8,\"time_stamp\":\"2022-03-01 11:00:00\"}]}"
  },
  {
    "label": "Empty Logins table",
    "input": "{\"rows\":[]}"
  }
];
