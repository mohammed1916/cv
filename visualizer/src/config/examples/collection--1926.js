// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Maze corridors offer exits at different distances",
    "input": "{\"maze\":[[\"+\",\"+\",\".\",\"+\",\"+\",\"+\"],[\"+\",\".\",\".\",\".\",\".\",\"+\"],[\"+\",\".\",\"+\",\"+\",\".\",\"+\"],[\".\",\".\",\".\",\".\",\".\",\"+\"],[\"+\",\"+\",\"+\",\".\",\"+\",\"+\"]],\"entrance\":[1,1]}"
  },
  {
    "label": "Boundary entrance does not count itself",
    "input": "{\"maze\":[[\".\",\".\",\".\"]],\"entrance\":[0,0]}"
  },
  {
    "label": "No other open boundary cell",
    "input": "{\"maze\":[[\"+\",\"+\",\"+\"],[\"+\",\".\",\"+\"],[\"+\",\"+\",\"+\"]],\"entrance\":[1,1]}"
  },
  {
    "label": "Only one open cell at the entrance",
    "input": "{\"maze\":[[\".\"]],\"entrance\":[0,0]}"
  }
];
