// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Obstacles create independent stone compartments",
    "input": "{\"box\":[[\"#\",\".\",\"#\",\"*\",\".\",\"#\",\".\"],[\".\",\"#\",\"*\",\"#\",\"#\",\".\",\".\"],[\"#\",\".\",\".\",\"*\",\"#\",\".\",\"#\"]]}"
  },
  {
    "label": "No stones to move",
    "input": "{\"box\":[[\".\",\"*\",\".\"],[\".\",\".\",\".\"]]}"
  },
  {
    "label": "One row settles before rotating",
    "input": "{\"box\":[[\"#\",\".\",\"#\",\".\",\".\"]]}"
  },
  {
    "label": "Obstacle traps a stone above it after rotation",
    "input": "{\"box\":[[\"#\",\"*\",\".\"]]}"
  }
];
