// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved users accumulate separate follower totals",
    "input": "{\"rows\":[{\"user_id\":12,\"follower_id\":3},{\"user_id\":4,\"follower_id\":9},{\"user_id\":12,\"follower_id\":8},{\"user_id\":7,\"follower_id\":3},{\"user_id\":4,\"follower_id\":12},{\"user_id\":12,\"follower_id\":15},{\"user_id\":7,\"follower_id\":18}]}"
  },
  {
    "label": "One follower may follow different users",
    "input": "{\"rows\":[{\"user_id\":5,\"follower_id\":20},{\"user_id\":9,\"follower_id\":20}]}"
  },
  {
    "label": "Single relationship",
    "input": "{\"rows\":[{\"user_id\":31,\"follower_id\":14}]}"
  },
  {
    "label": "No relationships",
    "input": "{\"rows\":[]}"
  }
];
