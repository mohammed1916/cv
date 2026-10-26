// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Short and long posts mixed in one table",
    "input": "{\"rows\":[{\"tweet_id\":21,\"content\":\"Cedar shade\"},{\"tweet_id\":7,\"content\":\"A quiet trail beside the river\"},{\"tweet_id\":34,\"content\":\"Morning birds sing loudly\"},{\"tweet_id\":3,\"content\":\"Oak\"},{\"tweet_id\":15,\"content\":\"The grove rests at dawn\"}]}"
  },
  {
    "label": "Exact fifteen-character boundary",
    "input": "{\"rows\":[{\"tweet_id\":1,\"content\":\"123456789012345\"},{\"tweet_id\":2,\"content\":\"1234567890123456\"}]}"
  },
  {
    "label": "No invalid tweets",
    "input": "{\"rows\":[{\"tweet_id\":8,\"content\":\"\"},{\"tweet_id\":9,\"content\":\"Short note\"}]}"
  },
  {
    "label": "Empty Tweets table",
    "input": "{\"rows\":[]}"
  }
];
