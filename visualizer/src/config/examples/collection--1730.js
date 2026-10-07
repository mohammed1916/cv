// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Obstacles force competing routes to two food cells",
    "input": "{\"grid\":[[\"X\",\"X\",\"X\",\"X\",\"X\",\"X\",\"X\"],[\"X\",\"*\",\"O\",\"O\",\"X\",\"#\",\"X\"],[\"X\",\"O\",\"X\",\"O\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"O\",\"O\",\"O\",\"X\"],[\"X\",\"#\",\"O\",\"O\",\"X\",\"O\",\"X\"],[\"X\",\"X\",\"X\",\"X\",\"X\",\"X\",\"X\"]]}"
  },
  {
    "label": "Adjacent food",
    "input": "{\"grid\":[[\"*\",\"#\"]]}"
  },
  {
    "label": "Food is enclosed",
    "input": "{\"grid\":[[\"*\",\"O\",\"X\"],[\"X\",\"X\",\"#\"]]}"
  },
  {
    "label": "Only one open corridor",
    "input": "{\"grid\":[[\"*\",\"O\",\"O\",\"O\",\"#\"]]}"
  }
];
