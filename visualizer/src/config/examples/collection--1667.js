// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed casing is normalized before numeric ID ordering",
    "input": "{\"rows\":[{\"user_id\":28,\"name\":\"rIVer\"},{\"user_id\":4,\"name\":\"CEDAR\"},{\"user_id\":19,\"name\":\"mOSS\"},{\"user_id\":7,\"name\":\"oAK\"},{\"user_id\":31,\"name\":\"Fern\"},{\"user_id\":12,\"name\":\"bIRCH\"}]}"
  },
  {
    "label": "One-letter names",
    "input": "{\"rows\":[{\"user_id\":9,\"name\":\"q\"},{\"user_id\":2,\"name\":\"Z\"}]}"
  },
  {
    "label": "Already normalized names",
    "input": "{\"rows\":[{\"user_id\":3,\"name\":\"Lina\"},{\"user_id\":8,\"name\":\"Arun\"}]}"
  },
  {
    "label": "Empty Users table",
    "input": "{\"rows\":[]}"
  }
];
