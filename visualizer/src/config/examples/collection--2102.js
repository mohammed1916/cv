// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Better insertions change the location at future ordinal ranks",
    "input": "{\"operations\":[[\"add\",\"harbor\",70],[\"add\",\"cedar\",85],[\"get\"],[\"add\",\"alpine\",92],[\"get\"],[\"add\",\"brook\",85],[\"add\",\"dune\",60],[\"get\"],[\"get\"]]}"
  },
  {
    "label": "Equal scores are ordered alphabetically",
    "input": "{\"operations\":[[\"add\",\"willow\",40],[\"add\",\"birch\",40],[\"add\",\"maple\",40],[\"get\"],[\"get\"],[\"get\"]]}"
  },
  {
    "label": "A previously returned name can appear at a later rank",
    "input": "{\"operations\":[[\"add\",\"delta\",30],[\"get\"],[\"add\",\"alpha\",50],[\"get\"]]}"
  },
  {
    "label": "One added location supports one query",
    "input": "{\"operations\":[[\"add\",\"orchard\",11],[\"get\"]]}"
  }
];
